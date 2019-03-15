package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.BadRequestException;
import com.improver.exception.ValidationException;
import com.improver.repository.ProjectMessageRepository;
import com.improver.repository.ProjectRequestRepository;
import com.improver.repository.ProjectRepository;
import com.improver.util.StringUtil;
import com.improver.util.mail.MailService;
import com.improver.ws.WsNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.improver.entity.Project.Status.IN_PROGRESS;


@Service
public class ProjectRequestService {

    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired private MailService mailService;

    /**
     * Creates a {@link ProjectRequest} with {@link ProjectRequest.Status#ACTIVE}
     * and {@link ProjectMessage} with {@link ProjectMessage.Event#REQUEST} type
     */
    public ProjectRequest createProjectRequest(Contractor contractor, Project lead, int leadPrice, boolean isManual) {
        ZonedDateTime now = ZonedDateTime.now();
        ProjectRequest projectRequest = projectRequestRepository.save(new ProjectRequest().setContractor(contractor)
            .setCreated(now)
            .setUpdated(now)
            .setProject(lead)
            .setManual(isManual)
            .setStatus(ProjectRequest.Status.ACTIVE));

        // update lead
        lead.decrementFreePosition()
            .setUpdated(now);
        if (lead.getStatus().equals(Project.Status.ACTIVE)) {
            lead.setStatus(Project.Status.IN_PROGRESS);
        }
        projectRepository.save(lead);

        // initialize chat
        List<ProjectMessage> projectMessages = new ArrayList<>(2);
        projectMessages.add(ProjectMessage.request(projectRequest, now));
        if (contractor.isQuickReply() && !StringUtil.isNullOrEmpty(contractor.getReplyText())) {
            projectMessages.add(ProjectMessage.plain(contractor.getId(), contractor.getReplyText(), projectRequest));
        }
        projectMessageRepository.saveAll(projectMessages);

        return projectRequest;
    }


    public void hirePro(ProjectRequest toHire) {
        ZonedDateTime time = ZonedDateTime.now();
        Project project = toHire.getProject();
        checkProjectIsActive(project);
        boolean declineOthers = true;
        List<ProjectRequest> relatedProjectRequests = projectRequestRepository.findRelatedProjectRequests(toHire.getId());
        relatedProjectRequests.forEach(projectRequest -> hireOneDeclineOthers(project, projectRequest, toHire.getId(), declineOthers, time));
        projectRequestRepository.saveAll(relatedProjectRequests);


        mailService.sendHiredContractorEmail(toHire.getContractor(), toHire);
    }

    public Map<ProjectRequest.Reason, String> getDeclineOptions(ProjectRequest projectRequest) {
        checkProjectIsActive(projectRequest.getProject());

        if (!ProjectRequest.Status.ACTIVE.equals(projectRequest.getStatus())) {
            throw new BadRequestException("Cannot decline hireOther contractor");
        }
        return projectRequest.getDeclineVariants();
    }

    public void closeProject(ProjectRequest projectRequest, ZonedDateTime now, boolean leave) {
        ProjectRequest.Status oldStatus = projectRequest.getStatus();
        if (projectRequest.getStatus().equals(ProjectRequest.Status.CLOSED)
            || projectRequest.getStatus().equals(ProjectRequest.Status.REFUNDED)) {
            throw new ValidationException("Project request is already closed");
        }
        projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.CLOSED).setUpdated(now));
        ProjectMessage message = leave ? ProjectMessage.leave(projectRequest, now) : ProjectMessage.proClose(projectRequest, now);
        projectMessageRepository.save(message);
        wsNotificationService.sendChatMessage(message, projectRequest.getId());
        Project project = projectRequest.getProject();

        if (!oldStatus.equals(ProjectRequest.Status.INACTIVE) &&
            !oldStatus.equals(ProjectRequest.Status.REFUND) &&
            !oldStatus.equals(ProjectRequest.Status.DECLINED))
            wsNotificationService.proLeftProject(project.getCustomer(),
                projectRequest.getContractor().getCompany(),
                project.getServiceType().getName(),
                project.getId());
    }

    public void declinePro(ProjectRequest projectRequest, ProjectRequest.Reason reason, String comment) {
        Project project = projectRequest.getProject();
        checkProjectIsActive(project);
        switch (projectRequest.getStatus()) {
            case ACTIVE:
                ZonedDateTime now = ZonedDateTime.now();
                projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.DECLINED)
                    .setReason(reason)
                    .setReasonComment(comment)
                    .setUpdated(now));
                sendDeclineNotification(project, projectRequest, now);
                break;
            case HIRED:
                throw new ValidationException("Cannot decline hired contractor");
            case DECLINED:
            case REFUND:
                throw new ValidationException("Contractor is already declined");
            default:
                throw new IllegalArgumentException(projectRequest.getStatus() + " is not a valid status");
        }

    }


    private Project checkProjectIsActive(Project project) {
        if (!project.getStatus().equals(IN_PROGRESS)) {
            throw new ValidationException("Project is not active");
        }
        return project;
    }

    private void hireOneDeclineOthers(Project project, ProjectRequest projectRequest, long projectRequestIdToHire, boolean declineOthers, ZonedDateTime time) {
        boolean toHire = projectRequest.getId() == projectRequestIdToHire;
        switch (projectRequest.getStatus()) {
            case HIRED:
                if (toHire) {
                    throw new ValidationException("Current contractor is already hired");
                } else {
                    throw new ValidationException("Other contractor is already hired");
                }

            case ACTIVE:
                if (toHire) {
                    projectRequest.setStatus(ProjectRequest.Status.HIRED).setUpdated(time);
                    projectRequestRepository.save(projectRequest);
                    projectRepository.removeLeadByProjectRequest(projectRequest.getId());
                    sendHireNotification(project, projectRequest, time);
                } else {
                    projectRequest.setStatus(ProjectRequest.Status.INACTIVE).setUpdated(time);
                    projectRequestRepository.save(projectRequest);
                    sendHireOtherNotification(project, projectRequest, time);
                }
                break;

            case DECLINED:
            case REFUND:
                if (toHire) {
                    throw new ValidationException("Cannot hire not active contractor");
                }
                break;

            default:
                if (toHire) {
                    throw new IllegalArgumentException(projectRequest.getStatus() + " is not a valid status");
                }
                break;
        }

    }


    /**
     * Creates {@link ProjectMessage} and notify chat
     */
    private void sendHireNotification(Project project, ProjectRequest projectRequest, ZonedDateTime updated) {
        ProjectMessage message = projectMessageRepository.save(ProjectMessage.hire(projectRequest, updated));
        wsNotificationService.sendChatMessage(message, projectRequest.getId());
        wsNotificationService.customerHired(projectRequest.getContractor(), project.getCustomer(), project.getServiceType().getName(), projectRequest.getId());
    }

    /**
     * Creates {@link ProjectMessage} and notify chat
     */
    private void sendHireOtherNotification(Project project, ProjectRequest projectRequest, ZonedDateTime updated) {
        ProjectMessage message = projectMessageRepository.save(ProjectMessage.hireOther(projectRequest, updated));
        wsNotificationService.sendChatMessage(message, projectRequest.getId());
        wsNotificationService.customerCloseProject(projectRequest.getContractor(), project.getCustomer(), project.getServiceType().getName(), projectRequest.getId());
    }

    /**
     * Creates {@link ProjectMessage} and notify chat
     */
    private void sendDeclineNotification(Project project, ProjectRequest projectRequest, ZonedDateTime updated) {
        ProjectMessage message = projectMessageRepository.save(ProjectMessage.decline(projectRequest, updated));
        wsNotificationService.sendChatMessage(message, projectRequest.getId());
        wsNotificationService.customerCloseProject(projectRequest.getContractor(), project.getCustomer(), project.getServiceType().getName(), projectRequest.getId());
    }


    /**
     * Returns list of {@link ProjectMessage} for given projectRequestId
     *
     * @param projectRequestId
     * @param user
     * @return
     */
    public List<ProjectMessage> getProjectMessages(long projectRequestId, User user) {
        if (user instanceof Staff) {
            return projectMessageRepository.getByProjectRequestIdOrderByCreatedAsc(projectRequestId);
        } else if (User.Role.CONTRACTOR.equals(user.getRole())) {
            return projectMessageRepository.getForContractor(projectRequestId, user);
        } else if (User.Role.CUSTOMER.equals(user.getRole())) {
            return projectMessageRepository.getForCustomer(projectRequestId, user);
        }
        throw new AccessDeniedException();
    }
}
