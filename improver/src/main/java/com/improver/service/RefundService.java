package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.in.RefundRequest;
import com.improver.model.out.RefundQuestionary;
import com.improver.model.out.RefundResult;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import com.improver.ws.WsNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.improver.application.properties.BusinessProperties.*;
import static com.improver.entity.Refund.Option.NOT_SCHEDULED;
import static com.improver.entity.Refund.Status.*;
import static java.time.ZonedDateTime.now;

@Slf4j
@Service
public class RefundService {

    private final static String REFUND_APPROVE_DEFAULT_MESSAGE = "Refund request approved";
    private final static String REFUND_REJECT_DEFAULT_MESSAGE = "Refund request rejected";
    private final static String REFUND_MANUAL_DEFAULT_MESSAGE = "Refund request applies to manual check";
    private final static String AUTO_APPROVE_TRANSACTION_COMMENT = "Refund approved by System";

    @Autowired private RefundRepository refundRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private CompanyService companyService;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private WsNotificationService wsNotificationService;
    @Autowired private BillRepository billRepository;
    @Autowired private MailService mailService;
    @Autowired private CompanyConfigService companyConfigService;

    public RefundQuestionary buildQuestionary(long projectRequestId) {
        ProjectRequest projectRequest = projectRequestRepository.findById(projectRequestId)
            .orElseThrow(NotFoundException::new);
        String zip = projectRequest.getProject().getLocation().getZip();
        String serviceName = projectRequest.getProject().getServiceType().getName();

        RefundQuestionary questionary = new RefundQuestionary().setZip(zip).setServiceName(serviceName);

        List<RefundQuestionary.Issue> issues = Refund.Issue.getAllOptions().entrySet().stream().map(
            entry -> new RefundQuestionary.Issue()
                .setName(entry.getKey())
                .setText(entry.getKey().getValue())
                .setQuestion(entry.getKey().getQuestion())
                .setOptions(entry.getValue().stream().map(option -> new RefundQuestionary.Option()
                    .setName(option)
                    .setText(option.getValue())
                ).collect(Collectors.toList()))
        ).collect(Collectors.toList());

        questionary.setIssues(issues);
        return questionary;
    }

    public RefundResult get(ProjectRequest projectRequest) {
        Refund refund = Optional.ofNullable(projectRequest.getRefund())
            .orElseThrow(NotFoundException::new);
        return new RefundResult(refund.getComment(), refund.getStatus(), refund.getCreated());
    }

    public void registerRefund(RefundRequest refundRequest, ProjectRequest projectRequest) {
        checkRefundability(projectRequest);

        Refund refund = new Refund().setCreated(now()).setUpdated(now());
        refund.setIssue(refundRequest.getIssue());
        refund.setOption(refundRequest.getOption());
        refundRepository.save(refund);
        projectRequest.setRefund(refund);
        projectRequest.setStatus(ProjectRequest.Status.REFUND_REQUESTED);
        projectRequestRepository.save(projectRequest);

        Project project = projectRequest.getProject();
        Company company = projectRequest.getContractor().getCompany();

        // remove zip and service area
        if (refundRequest.isRemoveZip()) {
            areaRepository.deleteZipCodesByCompanyId(company.getId(),
                Collections.singletonList(project.getLocation().getZip()));
        }
        if (refundRequest.isRemoveService()) {
            companyConfigService.removeCompanyService(company, project.getServiceType());
        }

        if (projectRequest.getStatus().equals(ProjectRequest.Status.ACTIVE)) {
            wsNotificationService.proLeftProject(project.getCustomer(), company, project.getServiceType().getName(), project.getId());
        }

        checkRefundConditions(refund, projectRequest);

    }

    @Async
    public void checkRefundConditions(Refund refund, ProjectRequest projectRequest) {

        Project project = projectRequest.getProject();
        ServiceType serviceType = project.getServiceType();
        Contractor contractor = projectRequest.getContractor();
        Company company = contractor.getCompany();
        Customer customer = project.getCustomer();

        if (project.getStatus().equals(Project.Status.INVALID)) {
            refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
            refund.setStatus(AUTO_APPROVED);
        } else {
            switch (refund.getOption()) {
                case NEVER_WORK_IN_ZIP:
                    // Case 1
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case SOMETIMES_WORK_IN_ZIP:
                    // Case 2
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case JOB_NOT_FOR_ZIP:
                    // Case 3
                    refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                    refund.setStatus(IN_REVIEW);
                    break;
                case NEVER_DO_SERVICE:
                    // Case 4
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case SOMETIMES_DO_SERVICE:
                    // Case 5
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case JOB_NOT_FOR_SERVICE:
                    // Case 6
                    refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                    refund.setStatus(IN_REVIEW);
                    break;
                case NOT_EQUIPPED:
                    // Case 7
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case OTHER:
                    // Case 8
                    refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                    refund.setNotes(refund.getNotes());
                    refund.setStatus(IN_REVIEW);
                    break;
                case NOT_READY_TO_HIRE:
                    // Case 9
                    refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                    refund.setStatus(IN_REVIEW);
                    break;
                case DECLINED:
                    // Case 10
                    refund = checkDeclinedProjectRequest(refund, projectRequest);
                    break;
                case NOT_SCHEDULED:
                    // Case 11
                    if (projectRequest.getCreated().plusDays(SCHEDULING_DAYS).isAfter(refund.getCreated())) {
                        refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_REJECTED);
                        break;
                    }
                    refund = checkRefundRelapse(refund, projectRequest, NOT_SCHEDULED);
                    if (refund.getStatus() == IN_REVIEW
                        && projectRequest.getStatus().equals(ProjectRequest.Status.DECLINED)
                        && projectRequest.getReason().equals(ProjectRequest.Reason.COULD_NOT_SCHEDULE)) {
                        refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_APPROVED);
                    }
                    break;
                case JOB_TOO_SMALL:
                    // Case 12
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case NOTHING_TO_DO:
                    // Case 13
                    refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                    refund.setStatus(IN_REVIEW);
                    break;
                case NO_RESPOND:
                    // Case 14
                    ProjectMessage lastMessage = projectMessageRepository
                        .findTop1ByProjectRequestOrderByCreatedDesc(projectRequest).orElse(null);

                    if (lastMessage == null) {
                        refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_REJECTED);
                    }

                    boolean isLastMessageFromPro = lastMessage.getSender()
                        .equals(String.valueOf(contractor.getId()));
                    boolean isLastMessageOld = lastMessage.getCreated().plusDays(SCHEDULING_DAYS)
                        .isBefore(now());

                    if (isLastMessageFromPro && isLastMessageOld) {
                        refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_REJECTED);
                    } else {
                        refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_APPROVED);
                    }
                    break;
                case DUPLICATE:
                    // Case 15
                    refund = checkDuplicatedProjects(project, refund);
                    break;
                case NOT_ENOUGH_INFO:
                    // Case 16
                    if (serviceType.getQuestionary() != null) {
                        refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_REJECTED);
                    } else {
                        refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                        refund.setStatus(IN_REVIEW);
                    }
                    break;
                case BAD_CONTACT_INFO:
                    // Case 17
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(IN_REVIEW);
                    break;
                case NOT_AGREED_PRICE:
                    // Case 18
                    refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                    refund.setStatus(AUTO_REJECTED);
                    break;
                case CLOSED:
                    // Case 19
                    if (project.getReason() == Project.Reason.EVALUATING ||
                        project.getReason() == Project.Reason.ESTIMATED) {
                        refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_APPROVED);
                    } else if (project.getReason() == Project.Reason.OTHER) {
                        refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                        refund.setStatus(IN_REVIEW);
                    } else {
                        refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                        refund.setStatus(AUTO_REJECTED);
                    }

                    break;
                default:
                    throw new IllegalArgumentException(refund.getOption() + " is not allowed refund option");
            }
        }

        ProjectMessage refundRequestMessage = ProjectMessage.refundRequest(projectRequest, now());
        projectMessageRepository.save(refundRequestMessage);
        refundRepository.save(refund);

        // get new projectRequest status according to refund status and send notifications
        ProjectRequest.Status newProjectRequestStatus;
        if (refund.getStatus() == AUTO_APPROVED) {
            newProjectRequestStatus = ProjectRequest.Status.REFUNDED;
            makeRefund(projectRequest, AUTO_APPROVE_TRANSACTION_COMMENT);
            mailService.sendRefundRequestApproved(company, customer.getDisplayName(), serviceType.getName());
            ProjectMessage refundApprovedMessage = ProjectMessage.refundApproved(projectRequest, now());
            projectMessageRepository.save(refundApprovedMessage);
        } else if (refund.getStatus() == AUTO_REJECTED) {
            newProjectRequestStatus = ProjectRequest.Status.REFUND_REJECTED;
            mailService.sendRefundRequestRejected(company, customer.getDisplayName(), serviceType.getName());
            projectMessageRepository.save(ProjectMessage.refundRejected(projectRequest, now()));
        } else {
            mailService.sendRefundRequestAccepted(company, customer.getDisplayName(), serviceType.getName());
            newProjectRequestStatus = ProjectRequest.Status.REFUND_REQUESTED;
        }

        projectRequest.setStatus(newProjectRequestStatus).setUpdated(now()).setRefund(refund);
        projectRequestRepository.save(projectRequest);

        log.info("Refund request submitted for projectRequest {}", projectRequest.getId());
    }

    private void checkRefundability(ProjectRequest projectRequest) {
        if (ProjectRequest.Status.getArchived().contains(projectRequest.getStatus())) {
            throw new ValidationException("Project is already hireOther");
        } else if (projectRequest.getRefund() != null) {
            throw new ValidationException("Refund request for this project is already submitted");
        } else if (now().isAfter(projectRequest.getCreated().plusDays(DAYS_TO_ACCEPT_REFUND))) {
            projectRequest.setStatus(ProjectRequest.Status.REFUND_REJECTED).setUpdated(now());
            projectRequestRepository.save(projectRequest);
            throw new ValidationException("The period of refund possibility by this project is over");
        }
    }

    private Refund checkDeclinedProjectRequest(Refund refund, ProjectRequest projectRequest) {

        if(!projectRequest.getStatus().equals(ProjectRequest.Status.DECLINED)) {
            refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
            refund.setStatus(IN_REVIEW);
            return refund;
        }

        switch (projectRequest.getReason()) {
            case TOO_EXPENSIVE:
                refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                refund.setStatus(AUTO_REJECTED);
                break;
            case HIRE_OTHER:
                refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
                refund.setStatus(AUTO_APPROVED);
                break;
            case NOT_RELIABLE:
                refund = checkDeclineRelapse(refund, projectRequest, ProjectRequest.Reason.NOT_RELIABLE);
                break;
            case NOT_QUALIFIED:
                refund = checkDeclineRelapse(refund, projectRequest, ProjectRequest.Reason.NOT_QUALIFIED);
                break;
            case COULD_NOT_SCHEDULE:
                refund = checkDeclineRelapse(refund, projectRequest, ProjectRequest.Reason.COULD_NOT_SCHEDULE);
                break;
            case DID_NOT_SHOW_UP:
                refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
                refund.setStatus(AUTO_REJECTED);
                break;
            case RUDE:
                refund = checkDeclineRelapse(refund, projectRequest, ProjectRequest.Reason.RUDE);
                break;
            case OTHER:
                refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE);
                refund.setStatus(IN_REVIEW);
                break;

            default:
                throw new IllegalArgumentException(projectRequest.getReason() + " is not allowed projectRequest decline reason");
        }
        return refund;
    }

    private Refund checkDeclineRelapse(Refund refund, ProjectRequest toDecline, ProjectRequest.Reason reason) {

        List<ProjectRequest> lastProjectRequestsByTime =
            projectRequestRepository
                .findByContractorAndCreatedBetweenOrderByCreated(toDecline.getContractor(),
                    now().minusDays(RELAPSE_TERM_DAYS),
                    now());
        List<ProjectRequest> lastProjectRequests =
            projectRequestRepository
                .findByContractorOrderByCreated(toDecline.getContractor(),
                    PageRequest.of(0, RELAPSE_PROJECT_COUNT,
                        Sort.by("created"))).getContent();

        long declinesByTime = lastProjectRequestsByTime.stream().filter(projectRequest -> projectRequest.getReason() == reason).count();
        long declinedByLastProjects = lastProjectRequests.stream().filter(projectRequest -> projectRequest.getReason() == reason).count();
        return checkRelapse(refund, declinesByTime, declinedByLastProjects);
    }

    private Refund checkRefundRelapse(Refund refund, ProjectRequest toCheck, Refund.Option option) {

        List<ProjectRequest> lastProjectRequestsByTime =
            projectRequestRepository
                .findByContractorAndCreatedBetweenOrderByCreated(toCheck.getContractor(),
                    now().minusDays(RELAPSE_TERM_DAYS),
                    now());
        List<ProjectRequest> lastProjectRequests =
            projectRequestRepository
                .findByContractorOrderByCreated(toCheck.getContractor(),
                    PageRequest.of(0, RELAPSE_PROJECT_COUNT,
                        Sort.by("created"))).getContent();

        long declinesByTime = lastProjectRequestsByTime.stream().filter(
            projectRequest -> projectRequest.getRefund() != null && projectRequest.getRefund().getOption() == option).count();
        long declinedByLastProjects = lastProjectRequests.stream().filter(
            projectRequest -> projectRequest.getRefund() != null && projectRequest.getRefund().getOption() == option).count();
        return checkRelapse(refund, declinesByTime, declinedByLastProjects);
    }

    private Refund checkRelapse(Refund refund, long declinesByTime, long declinedByLastProjects) {
        if (declinesByTime > ATTEMPTS_TO_RELAPSE || declinedByLastProjects > ATTEMPTS_TO_RELAPSE) {
            refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
            refund.setStatus(AUTO_REJECTED);
        } else {
            refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE );
            refund.setStatus(IN_REVIEW);
        }
        return refund;
    }

    private Refund checkDuplicatedProjects(Project project, Refund refund) {
        // TODO: mark duplicated project or create some issue or create issue by support if duplication confirmed in manual refund check (partially done)

        List<Project> duplications = projectRepository.findDuplications(project.getId(),
            project.getCreated().minusMinutes(DUPLICATED_PROJECT_DEVIATION_MINUTES),
            project.getCreated().plusMinutes(DUPLICATED_PROJECT_DEVIATION_MINUTES),
            project.getServiceType().getName(),
            project.getLocation().getStreetAddress());

        if (!duplications.isEmpty()) {
            refund.setComment(REFUND_APPROVE_DEFAULT_MESSAGE);
            refund.setStatus(AUTO_APPROVED);

            // adding system comment for duplicated projects
            duplications.forEach(duplicatedProject -> {
                projectActionRepository.save(
                    ProjectAction.systemComment("Project duplication found by system. This project is duplicated with "
                        + project.getId())
                        .setProject(duplicatedProject));
                projectActionRepository.save(
                    ProjectAction.systemComment("Project duplication found by system. This project is duplicated with "
                        + duplicatedProject.getId())
                        .setProject(project));
            });
            return refund;
        }

        List<Project> duplicationCandidates = projectRepository.findDuplicationCandidates(project.getId(),
            project.getCreated().minusMinutes(DUPLICATED_PROJECT_DEVIATION_MINUTES),
            project.getCreated().plusMinutes(DUPLICATED_PROJECT_DEVIATION_MINUTES),
            project.getServiceType().getName(),
            project.getLocation().getStreetAddress());

        if (!duplicationCandidates.isEmpty()) {
            refund.setComment(REFUND_MANUAL_DEFAULT_MESSAGE );
            refund.setStatus(IN_REVIEW);

            // adding system comment for duplicated projects
            duplicationCandidates.forEach(duplicatedProject -> {
                projectActionRepository.save(
                    ProjectAction.systemComment("Project duplication suspected by system. This project can be duplicated with "
                        + project.getId())
                        .setProject(duplicatedProject));
                projectActionRepository.save(
                    ProjectAction.systemComment("Project duplication suspected by system. This project can be duplicated with "
                        + duplicatedProject.getId())
                        .setProject(project));
            });

        } else {
            refund.setComment(REFUND_REJECT_DEFAULT_MESSAGE);
            refund.setStatus(AUTO_REJECTED);
        }

        return refund;
    }

    public void makeRefund(ProjectRequest projectRequest, String comment) {
        Company company = projectRequest.getContractor().getCompany();
        Billing billing = company.getBilling();
        Transaction purchase = transactionRepository.
            findByTypeAndCompanyAndProject(Transaction.Type.PURCHASE,
                projectRequest.getContractor().getCompany(),
                projectRequest.getId())
            .orElseThrow(() -> new NotFoundException("Purchase of this project not found"));

        if (purchase.getAmount() > 0) {
            billing = billing.addToBalance(purchase.getAmount());
            billRepository.save(billing);
            transactionRepository.save(Transaction.refund(projectRequest,
                false,
                purchase.getAmount(),
                billing.getBalance(),
                comment));
            transactionRepository.save(purchase.setRefunded(true));
            wsNotificationService.updateBalance(company, billing);
        }

    }

    public void approve(Refund refund, String comment) {
        ProjectRequest projectRequest = refund.getProjectRequest();
        Project project = projectRequest.getProject();
        ServiceType serviceType = project.getServiceType();
        Contractor contractor = projectRequest.getContractor();
        Company company = contractor.getCompany();
        Customer customer = project.getCustomer();
        ZonedDateTime now = now();
        makeRefund(projectRequest, AUTO_APPROVE_TRANSACTION_COMMENT);
        refund.setStatus(Refund.Status.APPROVED).setComment(comment).setUpdated(now);
        refundRepository.save(refund);
        mailService.sendRefundRequestApproved(company, customer.getDisplayName(), serviceType.getName());
        projectMessageRepository.save(ProjectMessage.refundApproved(projectRequest, now));
        // TODO: send notification
        projectRequest.setStatus(ProjectRequest.Status.CLOSED).setUpdated(now);
        projectRequestRepository.save(projectRequest);
    }

    public void reject(Refund refund, String comment) {
        ProjectRequest projectRequest = refund.getProjectRequest();
        Project project = projectRequest.getProject();
        ServiceType serviceType = project.getServiceType();
        Contractor contractor = projectRequest.getContractor();
        Company company = contractor.getCompany();
        Customer customer = project.getCustomer();
        ZonedDateTime now = now();
        refund.setStatus(Refund.Status.REJECTED).setComment(comment).setUpdated(now);
        refundRepository.save(refund);
        mailService.sendRefundRequestApproved(company, customer.getDisplayName(), serviceType.getName());
        projectMessageRepository.save(ProjectMessage.refundRejected(projectRequest, now));
        // TODO: send notification
        projectRequest.setStatus(ProjectRequest.Status.CLOSED).setUpdated(now);
        projectRequestRepository.save(projectRequest);
    }

    public void updateComment(Refund refund, String comment) {
        ZonedDateTime now = now();
        refund.setComment(comment).setUpdated(now);
        refundRepository.save(refund);
    }

    public void postProcessRefundRequests(Project project) {
        project.getProjectRequests().stream()
            .filter(pr -> pr.getStatus().equals(ProjectRequest.Status.REFUND_REQUESTED))
            .forEach(pr -> checkRefundConditions(pr.getRefund(), pr));
    }

}
