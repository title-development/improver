package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.in.ValidationProjectRequest;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.project.*;
import com.improver.repository.*;
import com.improver.util.mail.MailService;
import com.improver.ws.WsNotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;


import static com.improver.model.in.CloseProjectRequest.Action.INVALIDATE;


@Service
public class ProjectService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ImageService imageService;
    @Autowired private LocationService locationService;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired
    private CustomerProjectService customerProjectService;
    @Autowired private MailService mailService;


    public Project getProject(long id) {
        return projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
    }


    // ======== PRO
    public ProjectRequestDetailed getContractorProject(long projectRequestId, long contractorId) {
        ProjectRequestDetailed projectRequest = projectRequestRepository.getDetailedForPro(projectRequestId, contractorId)
            .orElseThrow(NotFoundException::new);
        return projectRequest.setImages(imageService.getProjectImageUrls(projectRequest.getProjectId()));
    }


    /**
     * Returns
     */
    public Page<ProjectRequestShort> getProjectsForProDashboard(Contractor contractor, boolean active, String search, Pageable pageable) {
        List<ProjectRequest.Status> statuses = active ? ProjectRequest.Status.getActive()
            : ProjectRequest.Status.getArchived();

        Page<ProjectRequestShort> projects = projectRequestRepository.getForDashboard(contractor.getId(), statuses, search, pageable);
        projects.forEach(project -> project.setUnreadMessages(projectMessageRepository.getUnreadMessagesCount(
            Long.toString(contractor.getId()),
            project.getId(),
            ProjectRequest.Status.getActiveForCustomer())));

        return projects;
    }

    public void updateLocation(Project project, Location location, User support) {

        try {
            if (!locationService.validate(location, false, true).isValid()) {
                throw new ValidationException(location.asText() + " invalid location");
            }
            projectRepository.save(project.setLocation(location).setUpdated(ZonedDateTime.now()));
            projectActionRepository.save(ProjectAction.updateLocation(location, support).setProject(project));
            log.debug("Location {} changed for project id={}", location.asText(), project.getId());
        } catch (ThirdPartyException e) {
            throw new InternalServerException("Cannot validate location", e);
        }

    }


    public void addComment(Project project, String comment, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now()));
        projectActionRepository.save(ProjectAction.commentProject(comment, support).setProject(project));
    }


    /**
     *
     *
     */
    public void processValidation(Project project, User support, ValidationProjectRequest request) {
        Project.Status newStatus = request.getStatus();
        Project.Status oldStatus = project.getStatus();

        if (Project.Status.getArchived().contains(oldStatus)) {
            throw new ValidationException(oldStatus + " invalid status for update");
        }

        switch (newStatus) {
            case VALIDATION:
                log.info("Project {} to validation", project.getId());
                toValidationProject(project, request.getReason(), request.getComment(), support);
                break;

            case ACTIVE:
                log.info("Project {} validation", project.getId());
                validateProject(project, request.getComment(), support);
                break;

            case INVALID:
                log.info("Project {} invalidation", project.getId());
                invalidateProject(project, request.getReason(), request.getComment(), support);
                break;

            default:
                throw new IllegalStateException(newStatus + " invalid status for validation");
        }
    }


    private void toValidationProject(Project project, Project.Reason reason, String comment, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setStatus(Project.Status.VALIDATION)
            .setReason(reason)
            .setLead(false)
        );
        projectActionRepository.save(ProjectAction.toValidationProject(reason, comment, support).setProject(project));
        if(project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, reason);
        }
        wsNotificationService.projectToValidation(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    private void validateProject(Project project, String text, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setStatus(Project.Status.ACTIVE)
            .setReason(null)
            .setLead(true)
        );
        projectActionRepository.save(ProjectAction.validateProject(text, support).setProject(project));
        if(project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, null);
        }
        wsNotificationService.projectValidated(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    private void invalidateProject(Project project, Project.Reason reason, String text, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setLead(false)
            .setStatus(Project.Status.INVALID)
            .setReason(reason)
        );
        projectActionRepository.save(ProjectAction.invalidateProject(reason, text, support).setProject(project));
        if (project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, reason);
        }
        wsNotificationService.projectInvalidated(project.getCustomer(), project.getServiceType().getName(), project.getId());

        customerProjectService.closeActiveProjectRequests(project, ZonedDateTime.now(), new CloseProjectRequest(INVALIDATE, reason, text));
    }
}
