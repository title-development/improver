package com.improver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.exception.ValidationException;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.out.ValidatedLocation;
import com.improver.model.in.OrderDetails;
import com.improver.repository.*;
import com.improver.model.in.Order;
import com.improver.model.in.QuestionAnswer;
import com.improver.util.serializer.SerializationUtil;
import com.improver.util.mail.MailService;
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
    @Autowired private UserService userService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private LeadService leadService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectActionRepository projectActionRepository;


    public void postOrder(Order order, Customer customer) {
        Project income = validateOrder(order);
        customer = Optional.ofNullable(customer)
            .orElseGet(() -> getExistingOrRegister(order));

        Project lead;
        List<QuestionAnswer> questionAnswers;
        if(customer.isActivated()) {
            lead = saveProjectOrder(income.setCustomer(customer));
            questionAnswers = SerializationUtil.fromJson(new TypeReference<List<QuestionAnswer>>() {}, lead.getDetails());
            mailService.sendOrderSubmitMail(customer, lead, order.getDetails(), questionAnswers, true);
        } else {
            income.setLead(false);
            lead = saveProjectOrder(income.setCustomer(customer));
            questionAnswers = SerializationUtil.fromJson(new TypeReference<List<QuestionAnswer>>() {}, lead.getDetails());
            mailService.sendAutoRegistrationConfirmEmail(customer, lead, order.getDetails(), questionAnswers, true);
        }

        if (lead.isLead()){
            leadService.matchLeadWithSubscribers(lead);
        }

    }

    private Customer getExistingOrRegister(Order order) {
        return customerRepository.findByEmail(order.getDetails().getEmail())
            .orElseGet(() -> autoRegisterCustomer(order));
    }

    private Customer autoRegisterCustomer(Order order) {
        UserRegistration registration = new UserRegistration()
            .setEmail(order.getDetails().getEmail())
            .setFirstName(order.getDetails().getFirstName())
            .setLastName(order.getDetails().getLastName())
            .setPhone(order.getDetails().getPhone());
        return (Customer) userService.saveNewUserRegistration(registration, User.Role.CUSTOMER);
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
        List<QuestionAnswer> validated = null;
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
        OrderDetails orderDetails = order.getDetails();
        try {
            ValidatedLocation validatedAddress = locationService.validate(orderDetails.getLocation(), false, true);
            if (!validatedAddress.isValid()) {
                throw new ValidationException(validatedAddress.getError());
            }
        } catch (ThirdPartyException e) {
            log.warn("Could not validate Address");
            systemComment = ProjectAction.systemComment("Address is not validated due to Shippo error");
            status = Project.Status.VALIDATION;
            isSuitableForPurchase = false;
        }

        Centroid centroid = servedZipRepository.findByZip(orderDetails.getLocation().getZip())
            .orElseThrow(ValidationException::new)
            .getCentroid();

        return new Project()
            .setCentroid(centroid)
            .setLead(isSuitableForPurchase)
            .setServiceType(serviceType)
            .setLeadPrice(serviceType.getLeadPrice())
            .setLocation(orderDetails.getLocation())
            .setStartDate(orderDetails.getStartExpectation())
            .setNotes(orderDetails.getNotes())
            .setDetails(order.getQuestionary()!= null? SerializationUtil.toJson(order.getQuestionary()): null )
            .setStatus(status)
            .setCreated(ZonedDateTime.now())
            .addSystemComment(systemComment);
    }






    private List<QuestionAnswer> validateQuestionary(List<QuestionAnswer> fromOrder, Questionary questionary) {
        List<QuestionAnswer> result = new ArrayList<>();
        if (fromOrder.size() != questionary.getQuestions().size()){
            throw new ValidationException("Answers for all questions are required");
        }
        for(QuestionAnswer questionAnswer : fromOrder) {
            Question question = questionary.getQuestionByName(questionAnswer.getName());
            if (question == null) {
                log.error("Question name=%s not exist!", questionAnswer.getName());
                throw new ValidationException("Invalid Questionary");
            }
            try {
                QuestionAnswer validated = validateAnswer(questionAnswer, question);
                result.add(validated);
            } catch (InvalidAnswerException e) {
                log.error("Invalid Questionary. " + e.getMessage());
                throw new ValidationException("Invalid Questionary");
            }
        }
        return result;
    }

    private QuestionAnswer validateAnswer(QuestionAnswer questionAnswer, Question question) throws InvalidAnswerException {
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

        return new QuestionAnswer(question.getTitle(), questionAnswer.getResults());
    }

    private boolean containsAnswer(String answerLabel, Question question) {
        return question.getAnswers().stream()
            .anyMatch(answer -> answer.getLabel().equals(answerLabel));
    }
}
