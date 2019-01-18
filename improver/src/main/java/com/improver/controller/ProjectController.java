package com.improver.controller;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.admin.out.AdminProject;
import com.improver.model.admin.in.ValidationProjectRequest;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.project.*;
import com.improver.model.in.Order;
import com.improver.repository.ProjectRequestRepository;
import com.improver.repository.ProjectRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.ImageService;
import com.improver.service.OrderService;
import com.improver.service.ProjectService;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.SupportAccess;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.time.ZonedDateTime;
import java.util.*;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(PROJECTS_PATH)
public class ProjectController {

    @Autowired private ProjectService projectService;
    @Autowired private OrderService orderService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ImageService imageService;
    @Autowired private UserSecurityService userSecurityService;

    @PreAuthorize("hasAnyRole('ANONYMOUS', 'CUSTOMER', 'ADMIN', 'SUPPORT')")
    @PostMapping
    public ResponseEntity<Void> postOrder(@RequestBody @Valid Order order) {
        Customer customer = userSecurityService.currentCustomerOrNull();
        orderService.postOrder(order, customer);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<AdminProject>> getProjects(@RequestParam(required = false) Long id,
                                                          @RequestParam(required = false) String customerEmail,
                                                          @RequestParam(required = false) String serviceType,
                                                          @RequestParam(required = false) Project.Status status,
                                                          @RequestParam(required = false) Project.Reason reason,
                                                          @RequestParam(required = false) String location,
                                                          @PageableDefault(sort = "created",page = 0, size = 10, direction = Sort.Direction.DESC) Pageable pageRequest){
        Page<AdminProject> projects = projectRepository.findBy(id, customerEmail, serviceType, status, reason, location, pageRequest)
            .map(AdminProject::from);

        return new ResponseEntity<>(projects, HttpStatus.OK);
    }


    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminProject> getProject(@PathVariable long id ){

        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        List<CompanyProjectRequest> pros = projectService.getProjectRequests(id);

        return new ResponseEntity<>(AdminProject.full(project, pros), HttpStatus.OK);
    }

    //TODO: Check this
    @SupportAccess
    @PutMapping(ID_PATH_VARIABLE + "/location")
    public ResponseEntity<Void> updateLocation(@PathVariable long id, @RequestBody Location location ){

        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        User support = userSecurityService.currentUser();

        projectService.updateLocation(project, location, support);

        return new ResponseEntity<>(HttpStatus.OK);
    }



    @SupportAccess
    @PutMapping(ID_PATH_VARIABLE + "/comment")
    public ResponseEntity<Void> addComment(@PathVariable long id, @RequestBody String comment ) {
        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        User support = userSecurityService.currentUser();
        projectService.addComment(project, comment, support);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PutMapping(ID_PATH_VARIABLE + "/validation")
    public ResponseEntity<Void> validateProject(@PathVariable long id, @RequestBody @Valid ValidationProjectRequest request ){

        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        User support = userSecurityService.currentUser();

        Project.Status newStatus = request.getResolution();
        Project.Status oldStatus = project.getStatus();

        if (oldStatus.equals(Project.Status.INVALID)) {
            throw new ValidationException(oldStatus + " invalid status for update");
        }

        switch (newStatus) {
            case VALIDATION:
                log.info("Project {} to validation", id);
                projectService.toValidationProject(project, request.getReason(), request.getComment(), support);
                break;

            case ACTIVE:
                log.info("Project {} validation", id);
                projectService.validateProject(project, request.getComment(), support);
                break;

            case INVALID:
                log.info("Project {} invalidation", id);
                projectService.invalidateProject(project, request.getReason(), request.getComment(), support);
                break;

            default:
                throw new IllegalStateException(newStatus + " invalid status for validation");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'SUPPORT')")
    @GetMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Collection<String>> getProjectPicturesUrls(@PathVariable long id) {
        Collection<String> images = imageService.getProjectImageUrls(id);
        return new ResponseEntity<>(images, HttpStatus.OK);
    }


    //TODO: remove to CustomerProject Controller
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Void> addProjectImage(@PathVariable long id, MultipartFile file) {
        Project project = projectService.getProject(id);
        String imageUrl = imageService.saveProjectImage(file, project);
        // Set first picture as a cover
        if (!project.hasCover()) {
            project.setCoverUrl(imageUrl);
        }
        projectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @DeleteMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<String> deleteProjectImage(@PathVariable long id, @RequestParam String imageUrl) {
        Project project = projectService.getProject(id);
        String newCoverUrl = imageService.deleteProjectImage(imageUrl, project);
        project.setCoverUrl(newCoverUrl);
        projectRepository.save(project.setUpdated(ZonedDateTime.now()));
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<CloseProjectQuestionary> getCloseVariants(@PathVariable long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        List<NameIdImageTuple> potentialExecutors = projectService.getPotentialExecutors(project);
        return new ResponseEntity<>(new CloseProjectQuestionary(potentialExecutors), HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<Void> closeProject(@PathVariable long id, @RequestBody @Valid CloseProjectRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        projectService.closeProject(project, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
