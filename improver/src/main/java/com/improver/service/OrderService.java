package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.InvalidAnswerException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.in.Order;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.improver.entity.Project.Status.INVALID;
import static com.improver.entity.Project.Status.VALIDATION;
import static com.improver.util.serializer.SerializationUtil.NUMERIC_PATTERN;

@Slf4j
@Service
public class OrderService {
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private LocationService locationService;
    @Autowired private RegistrationService registrationService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private LeadService leadService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private UserAddressRepository userAddressRepository;


    public long postOrder(Order order, Customer customer) {
        Project income = validateOrder(order);
        Project lead;
        log.debug("Project order {} validated", income.getServiceName());
        customer = Optional.ofNullable(customer)
            .orElseGet(() -> getExistingOrRegister(order));

        //TODO: This will change with saved Customer addresses
        if (order.getBaseLeadInfo().getPhone() != null){
            customer.setInternalPhone(order.getBaseLeadInfo().getPhone());
            customerRepository.save(customer);
        }

        //TODO: This is integration code. Should be removed after UserAddresses implemented fully
        if (!VALIDATION.equals(income.getStatus()) || !INVALID.equals(income.getStatus())) {
            boolean isNew = customer.getAddresses().stream()
                .noneMatch(userAddress -> userAddress.equalsIgnoreCase(income.getLocation()));
            if (isNew) {
                log.debug("Save new user address " + income.getLocation().asTextWithoutStreet() );
                userAddressRepository.save(new UserAddress(customer, income.getLocation()));
            }
        }

        if(customer.isActivated()) {
            lead = saveProjectOrder(income.setCustomer(customer));
            log.info("'{}' in {} leadId={} saved and put on market to match with subscribers", lead.getServiceName(), lead.getLocation().getZip(), lead.getId());
            mailService.sendOrderSubmitMail(customer, lead, order.getBaseLeadInfo(), true);
            leadService.matchLeadWithSubscribers(lead);
        } else {
            income.setLead(false);
            if (Project.Status.ACTIVE.equals(income.getStatus())){
                income.setStatus(Project.Status.PENDING);
            }
            lead = saveProjectOrder(income.setCustomer(customer));
            log.info("'{}' in {} leadId={} saved, but require customer activation", lead.getServiceName(), lead.getLocation().getZip(), lead.getId());
            log.info("Project id={} saved, but require customer activation", lead.getId());
            mailService.sendAutoRegistrationConfirmEmail(customer, lead, order.getBaseLeadInfo(), true, !customer.getSocialConnections().isEmpty());
        }

        return lead.getId();
    }


    private Customer getExistingOrRegister(Order order) {
        return customerRepository.findByEmail(order.getBaseLeadInfo().getEmail())
            .orElseGet(() -> registrationService.autoRegisterCustomer(order.getBaseLeadInfo()));
    }



    private Project saveProjectOrder(Project project) {
        Project saved = projectRepository.save(project.setUpdated(project.getCreated()));
        projectActionRepository.saveAll(saved.getProjectActions());
        return saved;

    }



    private Project validateOrder(Order order) {
        Project.Status status = Project.Status.ACTIVE;
        ProjectAction systemComment = null;
        boolean isSuitableForPurchase = true;

        // 1 Service
        ServiceType serviceType = serviceTypeRepository.findById(order.getServiceId())
            .orElseThrow(() -> new ValidationException("ServiceType id = " + order.getServiceId() + " not exist"));

        // 2 Questionary
        List<Order.QuestionAnswer> validated = null;
        Questionary questionary = serviceType.getQuestionary();

        if (questionary != null) {
            if (order.getQuestionary() != null) {
                validated = validateQuestionary(order.getQuestionary(), questionary);
            } else {
                throw new ValidationException("Questionary is empty!!!");
            }
        }
        order.setQuestionary(validated);


        // 3 Address
        Order.BaseLeadInfo baseLeadInfo = order.getBaseLeadInfo();
        boolean isManual = false;
        try {
            ValidatedLocation validatedAddress = locationService.validate(baseLeadInfo.getLocation(), false, true, isManual);
            if (!validatedAddress.isValid()) {
                throw new ValidationException(validatedAddress.getError());
            }
        //TODO: Misha: this should be eliminated when use customer saved addresses
        } catch (ThirdPartyException e) {
            log.warn("Could not validate Address");
            systemComment = ProjectAction.systemComment("Address is not validated due to Shippo error");
            status = VALIDATION;
            isSuitableForPurchase = false;
        }

        Centroid centroid = servedZipRepository.findByZip(baseLeadInfo.getLocation().getZip())
            .orElseThrow(() -> new ValidationException(baseLeadInfo.getLocation().getZip() + " ZIP Code is not in service area"))
            .getCentroid();

        return new Project()
            .setCentroid(centroid)
            .setLead(isSuitableForPurchase)
            .setServiceType(serviceType)
            .setServiceName(serviceType.getName())
            .setLeadPrice(serviceType.getLeadPrice())
            .setLocation(baseLeadInfo.getLocation())
            .setStartDate(baseLeadInfo.getStartExpectation())
            .setNotes(baseLeadInfo.getNotes())
            .setDetails(order.getQuestionary()!= null? SerializationUtil.toJson(order.getQuestionary()): null )
            .setStatus(status)
            .setCreated(ZonedDateTime.now())
            .addSystemComment(systemComment);
    }






    private List<Order.QuestionAnswer> validateQuestionary(List<Order.QuestionAnswer> fromOrder, Questionary questionary) {
        List<Order.QuestionAnswer> result = new ArrayList<>();
        if (fromOrder.size() != questionary.getQuestions().size()){
            throw new ValidationException("Answers for all questions are required");
        }
        for(Order.QuestionAnswer questionAnswer : fromOrder) {
            Question question = questionary.getQuestionByName(questionAnswer.getName());
            if (question == null) {
                log.error("Question name=%s not exist!", questionAnswer.getName());
                throw new ValidationException("Invalid Questionary");
            }
            try {
                Order.QuestionAnswer validated = validateAnswer(questionAnswer, question);
                result.add(validated);
            } catch (InvalidAnswerException e) {
                log.error("Invalid Questionary. " + e.getMessage());
                throw new ValidationException("Invalid Questionary");
            }
        }
        return result;
    }

    private Order.QuestionAnswer validateAnswer(Order.QuestionAnswer questionAnswer, Question question) throws InvalidAnswerException {
        if(question.isMultipleAnswers()) {
            long uniqueAnswers = questionAnswer.getResults().stream().distinct().count();
            if (uniqueAnswers != questionAnswer.getResults().size()) {
                throw new InvalidAnswerException("Answers '" + questionAnswer.getResults() + "' are not unique for question: " + question.getTitle());
            }
        }
        else if(questionAnswer.getResults().size() > 1 ) {
            throw new InvalidAnswerException("Multiple answers is not allowed here: " + question.getTitle());
        }

        if (question.isInputAnswer()) {
            String answer = questionAnswer.getResults().get(0);
            switch (question.getType()) {
                case NUMERIC_INPUT:
                    if(!NUMERIC_PATTERN.matcher(answer).matches()) {
                        throw new InvalidAnswerException("Answer '" + answer + "' is not allowed in question: " + question.getTitle());
                    }
                    break;
                case TEXT_INPUT:
                case TEXT_AREA:
                    break;
                default:
                    throw new IllegalArgumentException("Illegal question type=" + question.getType());

            }
        }
        else {
            for (String answerName : questionAnswer.getResults()) {
                if (!containsAnswer(answerName, question)) {
                    throw new InvalidAnswerException("Answer '" + answerName + "' is not allowed in question: " + question.getTitle());
                }
            }
        }

        return new Order.QuestionAnswer(question.getTitle(), questionAnswer.getResults());
    }

    private boolean containsAnswer(String answerLabel, Question question) {
        return question.getAnswers().stream()
            .anyMatch(answer -> answer.getLabel().equals(answerLabel));
    }
}
