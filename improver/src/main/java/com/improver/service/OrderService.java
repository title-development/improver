package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.in.Order;
import com.improver.model.out.ValidatedLocation;
import com.improver.model.out.project.OrderValidationResult;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

import static com.improver.entity.Project.Status.*;
import static com.improver.util.serializer.SerializationUtil.NUMERIC_PATTERN;

@Slf4j
@Service
public class OrderService {
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private LocationService locationService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MailService mailService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private LeadService leadService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserAddressRepository userAddressRepository;


    /**
     * Validates the order (address, answers, etc) and saves the project with NULL status and isLead=true.
     *
     * Flow:
     * Project doesn't go to the market, and no emails send.
     * Saves customer phone when order passes the validation.
     */
    public OrderValidationResult prepareOrder(Order order, Customer customer) {
        Project income = validateOrder(order, customer);
        //---- Update order flow
        if (null != order.getProjectId()) {
            Project project = projectRepository.findByIdAndCustomerId(order.getProjectId(), customer.getId())
                .orElseThrow(() -> new ValidationException("Cannot update not existing order"));
            income.setId(project.getId());
        }
        //----
        log.debug("Project order {} validated", income.getServiceName());
        if (order.getBaseLeadInfo().getPhone() != null){
            customer.setInternalPhone(order.getBaseLeadInfo().getPhone());
            customerRepository.save(customer);
        }

        Project lead = projectRepository.save(income.setCustomer(customer));
        return OrderValidationResult.valid(lead.getId(), lead.getLocation().getIsAddressManual());
    }


    @Deprecated
    private Project processOrder(Order order, Customer customer, Project toUpdate) {
        UserAddress savedAddress = null;
        Project project = toUpdate != null ? toUpdate
            : new Project().setLead(false).setStatus(null).setCreated(ZonedDateTime.now());

        if (toUpdate == null || !toUpdate.getLocation().equalsIgnoreCase(order.getAddress())) {
            // 1. Address
            if (order.getAddress().getId() != null) {
                savedAddress = userAddressRepository.findByIdAndCustomer(order.getAddress().getId(), customer)
                    .orElseThrow(() -> new ValidationException("User address not exist"));
                project.setLocation(savedAddress);
            } else {
                // new Address
                try {
                    ValidatedLocation validatedAddress = locationService.validateProjectAddress(order.getAddress());

                    //TODO: later
                    if (!validatedAddress.isValid()) {
                        log.info("Order address seem not be valid");
                        throw new OrderValidationException(validatedAddress);
                    }
                    project.setLocation(validatedAddress.getSuggested());
                    //

                } catch (ThirdPartyException e) {
                    log.error("Could not validate Address", e.getCause());
                    throw new InternalServerException("Address is not validated due to Shippo error");
                }
                Centroid centroid = servedZipRepository.findByZip(order.getAddress().getZip())
                    .orElseThrow(() -> new ValidationException(order.getAddress().getZip() + " ZIP Code is not in service area"))
                    .getCentroid();
                project.setCentroid(centroid);
            }
        }


        // 2 Service
        ServiceType serviceType = serviceTypeRepository.findById(order.getServiceId())
            .orElseThrow(() -> new ValidationException("ServiceType id = " + order.getServiceId() + " not exist"));

        // 3 Questionary
        List<Order.QuestionAnswer> validated = null;
        Questionary questionary = serviceType.getQuestionary();
        if (questionary != null) {
            if (order.getQuestionary() != null) {
                validated = validateQuestionary(order.getQuestionary(), questionary);
            } else {
                throw new ValidationException("Questionary is empty");
            }
        }
        order.setQuestionary(validated);

        return new Project()
            .setLead(false)
            .setServiceType(serviceType)
            .setServiceName(serviceType.getName())
            .setLeadPrice(serviceType.getLeadPrice())
            .setLocation(savedAddress != null ? savedAddress : order.getAddress())
            .setStartDate(order.getBaseLeadInfo().getStartExpectation())
            .setNotes(order.getBaseLeadInfo().getNotes())
            .setDetails(order.getQuestionary() != null ? SerializationUtil.toJson(order.getQuestionary()) : null )
            .setStatus(null)
            .setCreated(ZonedDateTime.now());
    }



    /**
     * Submit project to market.
     *
     * Flow:
     * Updates the project with PENDING or ACTIVE status and isLead=true, depending if customer
     * is activated. Saves customer address if needed.
     */
    public long submitProject(long projectId, Customer customer) {
        Project project = projectRepository.findByIdAndCustomerId(projectId, customer.getId())
            .orElseThrow(NotFoundException::new);
        if (null != project.getStatus() || project.isLead()) {
            throw new ConflictException("Order already submitted");
        }

        // 1. Save UserAddress if needed
        List<UserAddress> addresses = customer.getAddresses();
        if (addresses.isEmpty()) {
            userAddressRepository.save(new UserAddress(customer, project.getLocation()).setIsDefault(true));
            log.debug("Save default user address " + project.getLocation().asTextWithoutStreet());
        } else {
            boolean isNew = addresses.stream()
                .noneMatch(userAddress -> userAddress.equalsIgnoreCase(project.getLocation()));
            if (isNew) {
                userAddressRepository.save(new UserAddress(customer, project.getLocation()));
                log.debug("Save new user address " + project.getLocation().asTextWithoutStreet());
            }
        }

        // 2. Update Project and send to market if needed
        Project lead;
        project.setUpdated(ZonedDateTime.now());
        if(customer.isActivated()) {
            lead = projectRepository.save(project.setStatus(ACTIVE).setLead(true));
            log.info("'{}' in {} leadId={} saved and put on market to match with subscribers", lead.getServiceName(), lead.getLocation().getZip(), lead.getId());
            mailService.sendOrderSubmitMail(customer, lead, false);
            leadService.matchLeadWithSubscribers(lead);
        } else {
            lead = projectRepository.save(project.setStatus(PENDING).setLead(false));
            log.info("'{}' in {} leadId={} saved, but require customer activation", lead.getServiceName(), lead.getLocation().getZip(), lead.getId());
            log.info("Project id={} saved, but require customer activation", lead.getId());
            mailService.sendAutoRegistrationConfirmEmail(customer, lead, false, !customer.getSocialConnections().isEmpty());
        }
        return projectId;
    }


    private Project validateOrder(Order order, Customer customer) {
        UserAddress savedAddress = null;

        // 1 Address
        if (order.getAddress().getId() != null) {
            savedAddress = userAddressRepository.findByIdAndCustomer(order.getAddress().getId(), customer)
                .orElseThrow(() -> new ValidationException("User address not exist"));
        } else {
            // new Address
            try {
                ValidatedLocation validatedAddress = locationService.validateProjectAddress(order.getAddress());
                if (!validatedAddress.isValid()) {
                    log.info("Order address seem not be valid");
                    throw new OrderValidationException(validatedAddress);
                }
            } catch (ThirdPartyException e) {
                log.error("Could not validate Address", e.getCause());
                throw new InternalServerException("Address is not validated due to Shippo error");
            }
        }
        Centroid centroid = servedZipRepository.findByZip(order.getAddress().getZip())
            .orElseThrow(() -> new ValidationException(order.getAddress().getZip() + " ZIP Code is not in service area"))
            .getCentroid();


        // 2 Service
        ServiceType serviceType = serviceTypeRepository.findById(order.getServiceId())
            .orElseThrow(() -> new ValidationException("ServiceType id = " + order.getServiceId() + " not exist"));

        // 3 Questionary
        List<Order.QuestionAnswer> validated = null;
        Questionary questionary = serviceType.getQuestionary();
        if (questionary != null) {
            if (order.getQuestionary() != null) {
                validated = validateQuestionary(order.getQuestionary(), questionary);
            } else {
                throw new ValidationException("Questionary is empty");
            }
        }
        order.setQuestionary(validated);

        return new Project()
            .setCentroid(centroid)
            .setLead(false)
            .setServiceType(serviceType)
            .setServiceName(serviceType.getName())
            .setLeadPrice(serviceType.getLeadPrice())
            .setLocation(savedAddress != null ? savedAddress : order.getAddress())
            .setStartDate(order.getBaseLeadInfo().getStartExpectation())
            .setNotes(order.getBaseLeadInfo().getNotes())
            .setDetails(order.getQuestionary() != null ? SerializationUtil.toJson(order.getQuestionary()) : null )
            .setStatus(null)
            .setCreated(ZonedDateTime.now());
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


    public void removeOrder(long projectId, Customer customer) {
        Project project = projectRepository.findByIdAndCustomerId(projectId, customer.getId())
            .orElseThrow(NotFoundException::new);
        if (null != project.getStatus() || project.isLead()) {
            throw new ConflictException("Order cannot be removed when processed.");
        }
        log.info("Removing order {} id={}", project.getServiceName(), projectId);
        projectRepository.delete(project);
    }
}
