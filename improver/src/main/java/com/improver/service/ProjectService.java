package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.admin.in.ValidationProjectRequest;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.project.ProjectRequestDetailed;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.ProjectActionRepository;
import com.improver.repository.ProjectMessageRepository;
import com.improver.repository.ProjectRepository;
import com.improver.repository.ProjectRequestRepository;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

import static com.improver.model.in.CloseProjectRequest.Action.INVALIDATE;

@Slf4j
@Service
public class ProjectService {

    // @Autowired private ProjectService self;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ImageService imageService;
    @Autowired private LocationService locationService;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private WsNotificationService wsNotificationService;
    @Autowired private CustomerProjectService customerProjectService;
    @Autowired private MailService mailService;
    @Autowired private RefundService refundService;


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

    public void updateLocation(Project project, Location location, boolean isManual, User support) {
        if (project.getStatus() != Project.Status.VALIDATION) {
            throw new ValidationException("Location update is not allowed for current project state");
        }
        try {
            if (!locationService.validate(location, false, true, isManual).isValid()) {
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
            case IN_PROGRESS:
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

    public void toValidationProject(Project project, Project.Reason reason, String comment, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setStatus(Project.Status.VALIDATION)
            .setReason(reason)
            .setLead(false)
        );
        projectActionRepository.save(ProjectAction.toValidationProject(reason, comment, support).setProject(project));
        mailService.sendProjectStatusChanged(project, reason);
        wsNotificationService.projectToValidation(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    public void validateProject(Project project, String text, User support) {

        if (!project.getStatus().equals(Project.Status.VALIDATION)) {
            throw new ValidationException("Only projects with VALIDATION status can be validated");
        }

        if (project.getFreePositions() > 0) {
            project.setLead(true);
        }

        Project.Status statusBeforeValidation = project.hasProjectRequests() ? Project.Status.IN_PROGRESS : Project.Status.ACTIVE;

        project.setStatus(statusBeforeValidation)
            .setUpdated(ZonedDateTime.now())
            .setReason(null);

        projectRepository.save(project);

        projectActionRepository.save(ProjectAction.validateProject(text, support).setProject(project));
        mailService.sendProjectStatusChanged(project, null);
        wsNotificationService.projectValidated(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    @Transactional
    public void invalidateProject(Project project, Project.Reason reason, String text, User support) {

        if (!project.getStatus().equals(Project.Status.VALIDATION)) {
            throw new ValidationException("Only projects with VALIDATION status can be invalidated");
        }

        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setLead(false)
            .setStatus(Project.Status.INVALID)
            .setReason(reason)
        );
        projectActionRepository.save(ProjectAction.invalidateProject(reason, text, support).setProject(project));
        mailService.sendProjectStatusChanged(project, reason);

        wsNotificationService.projectInvalidated(project.getCustomer(), project.getServiceType().getName(), project.getId());

        customerProjectService.closeActiveProjectRequests(project, ZonedDateTime.now(), new CloseProjectRequest(INVALIDATE, reason, text));

        refundService.postProcessRefundRequests(project);

    }

}
