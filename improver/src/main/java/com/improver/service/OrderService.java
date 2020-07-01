package com.improver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.InvalidAnswerException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.in.Order;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.improver.util.serializer.SerializationUtil.NUMERIC_PATTERN;

@Service
public class OrderService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private LocationService locationService;
    @Autowired private RegistrationService registrationService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private LeadService leadService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectActionRepository projectActionRepository;


    public void postOrder(Order order, Customer customer) {
        Project income = validateOrder(order);
        log.debug("Project order {} validated", income.getServiceName());
        customer = Optional.ofNullable(customer)
            .orElseGet(() -> getExistingOrRegister(order));

        if (order.getBaseLeadInfo().getPhone() != null){
            customer.setInternalPhone(order.getBaseLeadInfo().getPhone());
            customerRepository.save(customer);
        }

        Project lead;
        List<Order.QuestionAnswer> questionAnswers;
        if(customer.isActivated()) {
            lead = saveProjectOrder(income.setCustomer(customer));
            log.info("Lead id={} saved and put to market", lead.getId());
            questionAnswers = SerializationUtil.fromJson(new TypeReference<>() {}, lead.getDetails());
            mailService.sendOrderSubmitMail(customer, lead, order.getBaseLeadInfo(), questionAnswers, true);
        } else {
            income.setLead(false);
            lead = saveProjectOrder(income.setCustomer(customer));
            log.info("Project id={} saved, but require customer activation", lead.getId());
            questionAnswers = SerializationUtil.fromJson(new TypeReference<>() {}, lead.getDetails());
            mailService.sendAutoRegistrationConfirmEmail(customer, lead, order.getBaseLeadInfo(), questionAnswers, true);
        }


        if (lead.isLead()){
            log.info("Lead id={} is about to match with subscribers", lead.getId());
            leadService.matchLeadWithSubscribers(lead);
        }

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
        try {
            ValidatedLocation validatedAddress = locationService.validate(baseLeadInfo.getLocation(), false, true);
            if (!validatedAddress.isValid()) {
                throw new ValidationException(validatedAddress.getError());
            }
        } catch (ThirdPartyException e) {
            log.warn("Could not validate Address");
            systemComment = ProjectAction.systemComment("Address is not validated due to Shippo error");
            status = Project.Status.VALIDATION;
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
