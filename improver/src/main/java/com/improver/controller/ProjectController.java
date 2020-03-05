package com.improver.controller;

import com.improver.entity.Customer;
import com.improver.entity.Location;
import com.improver.entity.Project;
import com.improver.entity.User;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.in.ValidationProjectRequest;
import com.improver.model.admin.out.AdminProject;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.in.Order;
import com.improver.model.out.project.CloseProjectQuestionary;
import com.improver.model.out.project.CompanyProjectRequest;
import com.improver.repository.ProjectRepository;
import com.improver.repository.ProjectRequestRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.CustomerProjectService;
import com.improver.service.ImageService;
import com.improver.service.OrderService;
import com.improver.service.ProjectService;
import com.improver.util.annotation.PageableSwagger;
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

import javax.validation.Valid;
import java.util.List;

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
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private CustomerProjectService customerProjectService;

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
        List<CompanyProjectRequest> pros = projectRequestRepository.getShortProjectRequests(id);
        return new ResponseEntity<>(AdminProject.full(project, pros), HttpStatus.OK);
    }


    @Deprecated
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
        projectService.processValidation(project, support, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    @GetMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<CloseProjectQuestionary> getCloseVariants(@PathVariable long id) {
        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        CloseProjectQuestionary questionary = customerProjectService.getCloseVariants(project);
        return new ResponseEntity<>(questionary, HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT')")
    @PostMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<Void> closeProject(@PathVariable long id, @RequestBody @Valid CloseProjectRequest request) {
        Project project = projectRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        customerProjectService.closeProject(project, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
