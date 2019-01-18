package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.project.*;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


import static com.improver.entity.Project.Status.CANCELED;
import static com.improver.entity.Project.Status.COMPLETED;
import static com.improver.entity.Project.Status.IN_PROGRESS;


@Service
public class ProjectService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ImageService imageService;
    @Autowired private LocationService locationService;
    @Autowired private ProjectActionRepository projectActionRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private MailService mailService;


    public Page<CustomerProjectShort> getProjectsForCustomer(Customer customer, boolean current, Pageable pageable) {
        List<Project.Status> statuses = (current) ? Project.Status.getActive() : Project.Status.getArchived();
        Page<CustomerProjectShort> projectsPage = projectRepository.findByCustomerAndStatuses(customer.getId(), statuses, pageable);
        projectsPage.forEach(project -> project.setProjectRequests(projectRequestRepository.getShortProjectRequestsWithMsgCount(project.getId(), Long.toString(customer.getId()))));
        return projectsPage;
    }


    public CustomerProject getCustomerProject(long projectId, Long customerId) {
        Project project = projectRepository.findById(projectId)
            .orElseThrow(NotFoundException::new);
        List<CompanyProjectRequest> pros = projectRequestRepository.getShortProjectRequestsWithMsgCount(projectId, Long.toString(customerId));
        Collection<String> photos = imageService.getProjectImageUrls(projectId);
        return new CustomerProject(project, pros, photos);
    }


    public List<CompanyProjectRequest> getProjectRequests(long projectId) {
        return projectRequestRepository.getShortProjectRequests(projectId);
    }


    public Project getProject(long id) {
        return projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
    }


    public void closeProject(Project project, CloseProjectRequest request) {
        ZonedDateTime time = ZonedDateTime.now();
        updateProjectToClose(project, request, time);
        if (request.getAction().equals(CloseProjectRequest.Action.CANCEL)) {
            log.info("Canceling all projectRequests the project {}", project.getId());
        } else if (request.getReason().equals(Project.Reason.DONE)) {
            log.info("Completing the project {}", project.getId());
            updateProjectRequestToCompleted(project, request, time);
        }
        log.debug("All Active projectRequests marked as INACTIVE for project={}", project.getId());
        closeActiveProjectRequests(project, time, request);
    }

    @Transactional
    public void updateProjectToClose(Project project, CloseProjectRequest request, ZonedDateTime time) {
        Project.Status newStatus;
        if (request.getAction().equals(CloseProjectRequest.Action.CANCEL)) {
            newStatus = CANCELED;
            log.info("Canceling the project {}", project.getId());
        } else {
            log.info("Completing the project {}", project.getId());
            newStatus = COMPLETED;
            switch (project.getStatus()) {
                case IN_PROGRESS:
                    break;

                case VALIDATION:
                case ACTIVE:
                    if (request.getProjectRequestId() > 0) {
                        throw new ValidationException("Project status " + project.getStatus().toString() + " cannot have executors");
                    }
                    break;

                case CANCELED:
                case COMPLETED:
                default:
                    throw new ValidationException("Invalid operation for Project status " + project.getStatus().toString());
            }
        }

        projectRepository.save(project.setStatus(newStatus)
            .setReason(request.getReason())
            .setUpdated(time)
            .setLead(false));
    }

    private void closeActiveProjectRequests(Project project, ZonedDateTime time, CloseProjectRequest request) {
        List<ProjectRequest> projectRequests = projectRequestRepository.findByStatusAndProjectId(ProjectRequest.Status.ACTIVE, project.getId());
        boolean hireOther = request.getProjectRequestId() > 0;
        projectRequests.forEach(projectRequest -> {
            projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.INACTIVE).setUpdated(time));
            ProjectMessage message = null;
            if (request.getAction().equals(CloseProjectRequest.Action.CANCEL)) {
                message = ProjectMessage.cancel(projectRequest, time);
            } else {
                if (hireOther) {
                    message = ProjectMessage.hireOther(projectRequest, time);
                } else {
                    message = ProjectMessage.close(projectRequest, time);
                }
            }
            projectMessageRepository.save(message);
            notificationService.sendChatMessage(message, projectRequest.getId());
            notificationService.customerCloseProject(projectRequest.getContractor(), project.getCustomer(), project.getServiceType().getName(), projectRequest.getId());
        });
    }


    /**
     * Updates given projectRequest to {@link ProjectRequest.Status#COMPLETED}
     */
    private void updateProjectRequestToCompleted(Project project, CloseProjectRequest closeProjectRequest, ZonedDateTime time) {
        long projectRequestId = closeProjectRequest.getProjectRequestId();
        ProjectRequest projectRequest;

        if (projectRequestId > 0) {
            projectRequest = projectRequestRepository.findByIdAndProjectId(projectRequestId, project.getId())
                .orElseThrow(ValidationException::new);
        } else {
            List<ProjectRequest> list = projectRequestRepository.findByStatusAndProjectId(ProjectRequest.Status.HIRED, project.getId());
            projectRequest = list.size() == 1 ? list.get(0) : null;
        }

        if (projectRequest != null
            && (projectRequest.getStatus().equals(ProjectRequest.Status.ACTIVE)
            || projectRequest.getStatus().equals(ProjectRequest.Status.HIRED))) {
            projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.COMPLETED).setUpdated(ZonedDateTime.now()));
            ProjectMessage message = projectMessageRepository.save(ProjectMessage.close(projectRequest, time));
            notificationService.sendChatMessage(message, projectRequest.getId());
            notificationService.customerCloseProject(projectRequest.getContractor(), project.getCustomer(), project.getServiceType().getName(), projectRequest.getId());
        } else {
            throw new ValidationException("Invalid executor");
        }

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
        projects.forEach(project -> project.setUnreadMessages(projectMessageRepository.getUnreadMessagesCount(Long.toString(contractor.getId()), project.getId())));

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

    public void changeOwner(Project project, Customer customer, User support) {
        String comment = "Email changed from " + project.getCustomer().getEmail() + " to " + customer.getEmail();
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setCustomer(customer)
        );
        projectActionRepository.save(ProjectAction.changeOwner(comment, support).setProject(project));
    }

    public void invalidateProject(Project project, Project.Reason reason, String text, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setLead(false)
            .setStatus(Project.Status.INVALID)
            .setReason(reason)
        );
        projectActionRepository.save(ProjectAction.invalidateProject(reason, text, support).setProject(project));
        if(project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, reason);
        }
        notificationService.projectInvalidated(project.getCustomer(), project.getServiceType().getName(), project.getId());

    }

    public void toValidationProject(Project project, Project.Reason reason, String comment, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setStatus(Project.Status.VALIDATION)
            .setLead(false)
        );
        projectActionRepository.save(ProjectAction.toValidationProject(reason, comment, support).setProject(project));
        if(project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, reason);
        }
        notificationService.projectToValidation(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    public void validateProject(Project project, String text, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now())
            .setStatus(Project.Status.ACTIVE)
            .setLead(true)
        );
        projectActionRepository.save(ProjectAction.validateProject(text, support).setProject(project));
        if(project.getCustomer().getMailSettings().isProjectLifecycle()) {
            mailService.sendProjectStatusChanged(project, null);
        }
        notificationService.projectValidated(project.getCustomer(), project.getServiceType().getName(), project.getId());
    }

    public void addComment(Project project, String comment, User support) {
        projectRepository.save(project.setUpdated(ZonedDateTime.now()));
        projectActionRepository.save(ProjectAction.commentProject(comment, support).setProject(project));
    }

    public List<NameIdImageTuple> getPotentialExecutors(Project project) {
        List<NameIdImageTuple> potentialExecutors = Collections.emptyList();
        if (IN_PROGRESS.equals(project.getStatus())) {
            List<CompanyProjectRequest> projectRequests = getProjectRequests(project.getId());
            boolean executorExist = projectRequests.stream()
                .anyMatch(projectRequest -> projectRequest.getStatus().equals(ProjectRequest.Status.HIRED));
            if (!executorExist) {
                potentialExecutors = projectRequests.stream()
                    .filter(projectRequest -> projectRequest.getStatus().equals(ProjectRequest.Status.ACTIVE))
                    .map(projectRequest -> new NameIdImageTuple(projectRequest.getId(), projectRequest.getCompany().getName(), projectRequest.getCompany().getIconUrl()))
                    .collect(Collectors.toList());
            }
        }
        return potentialExecutors;
    }
}
