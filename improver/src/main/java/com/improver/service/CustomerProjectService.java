package com.improver.service;

import com.improver.entity.Customer;
import com.improver.entity.Project;
import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.project.CompanyProjectRequest;
import com.improver.model.out.project.CustomerProject;
import com.improver.model.out.project.CustomerProjectShort;
import com.improver.repository.ProjectMessageRepository;
import com.improver.repository.ProjectRepository;
import com.improver.repository.ProjectRequestRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.entity.Project.Status.CANCELED;
import static com.improver.entity.Project.Status.COMPLETED;
import static com.improver.entity.Project.Status.IN_PROGRESS;
import static com.improver.model.in.CloseProjectRequest.Action.CANCEL;
import static com.improver.model.in.CloseProjectRequest.Action.INVALIDATE;

@Slf4j
@Service
public class CustomerProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectRequestRepository projectRequestRepository;
    @Autowired
    private ImageService imageService;
    @Autowired
    private ProjectMessageRepository projectMessageRepository;
    @Autowired
    private NotificationService notificationService;


    public Page<CustomerProjectShort> getProjectsForCustomer(Customer customer, boolean current, Pageable pageable) {
        List<Project.Status> statuses = (current) ? Project.Status.getActive() : Project.Status.getArchived();
        Page<CustomerProjectShort> projectsPage = projectRepository.findByCustomerAndStatuses(customer.getId(), statuses, pageable);
        projectsPage.forEach(project -> project.setProjectRequests(projectRequestRepository.getShortProjectRequestsWithMsgCount(project.getId(), Long.toString(customer.getId()))));
        return projectsPage;
    }


    @Deprecated
    // TODO: redundant findByIdAndCustomerId()
    public List<CompanyProjectRequest> getProjectRequests(Customer customer, long projectId) {
        Project project = projectRepository.findByIdAndCustomerId(projectId, customer.getId())
            .orElseThrow(NotFoundException::new);
        return projectRequestRepository.getProjectRequestsForCustomer(customer, project.getId());
    }

    public CustomerProject getCustomerProject(long projectId, Customer customer) {
        Project project = projectRepository.findByIdAndCustomerId(projectId, customer.getId())
            .orElseThrow(NotFoundException::new);
        List<CompanyProjectRequest> pros = projectRequestRepository.getShortProjectRequestsWithMsgCount(projectId, Long.toString(customer.getId()));
        Collection<String> photos = imageService.getProjectImageUrls(projectId);
        return new CustomerProject(project, pros, photos);
    }

    public List<NameIdImageTuple> getPotentialExecutors(Project project) {
        List<NameIdImageTuple> potentialExecutors = Collections.emptyList();
        if (IN_PROGRESS.equals(project.getStatus())) {
            List<CompanyProjectRequest> projectRequests = projectRequestRepository.getShortProjectRequests(project.getId());
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


    public void closeProject(Project project, CloseProjectRequest request) {
        ZonedDateTime time = ZonedDateTime.now();
        updateProjectToClose(project, request, time);
        if (request.getAction().equals(CANCEL)) {
            log.info("Canceling all projectRequests the project {}", project.getId());
        } else if (request.getReason().equals(Project.Reason.DONE)) {
            log.info("Completing the project {}", project.getId());
            updateProjectRequestToCompleted(project, request, time);
        }
        log.debug("All Active projectRequests marked as INACTIVE for project={}", project.getId());
        closeActiveProjectRequests(project, time, request);
    }

    public void closeActiveProjectRequests(Project project, ZonedDateTime time, CloseProjectRequest request) {
        List<ProjectRequest> projectRequests = projectRequestRepository.findByStatusAndProjectId(ProjectRequest.Status.ACTIVE, project.getId());
        boolean hireOther = request.getProjectRequestId() > 0;
        projectRequests.forEach(projectRequest -> {
            projectRequestRepository.save(projectRequest.setStatus(ProjectRequest.Status.INACTIVE).setUpdated(time));
            ProjectMessage message = null;
            if (request.getAction().equals(CANCEL)) {
                message = ProjectMessage.cancel(projectRequest, time);
            } else if (request.getAction().equals(INVALIDATE)) {
                message = ProjectMessage.invalidate(projectRequest, time);
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


    private void updateProjectToClose(Project project, CloseProjectRequest request, ZonedDateTime time) {
        Project.Status newStatus;
        if (request.getAction().equals(CANCEL)) {
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
}
