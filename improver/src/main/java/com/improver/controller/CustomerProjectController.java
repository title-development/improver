package com.improver.controller;

import com.improver.entity.Customer;
import com.improver.entity.Project;
import com.improver.entity.Refund;
import com.improver.exception.NotFoundException;
import com.improver.model.in.CloseProjectRequest;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.project.CloseProjectQuestionary;
import com.improver.model.out.project.CustomerProject;
import com.improver.model.out.project.CustomerProjectShort;
import com.improver.model.out.project.CompanyProjectRequest;
import com.improver.repository.ProjectRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.CustomerProjectService;
import com.improver.service.ImageService;
import com.improver.service.ProjectService;
import com.improver.util.annotation.PageableSwagger;
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
import java.util.List;
import java.util.Optional;

import static com.improver.application.properties.Path.*;

@PreAuthorize("hasRole('CUSTOMER')")
@RestController
@RequestMapping(CUSTOMERS_PATH + PROJECTS)
public class CustomerProjectController {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired
    private CustomerProjectService customerProjectService;
    @Autowired
    private ProjectRepository projectRepository;


    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<CustomerProjectShort>> getCustomerProjects(@RequestParam(defaultValue = "true") boolean active,
                                                                          @PageableDefault(sort = "created", page = 0, size = 10, direction = Sort.Direction.DESC) Pageable pageRequest) {

        Customer customer = userSecurityService.currentCustomer();
        Page<CustomerProjectShort> projectsPage = customerProjectService.getProjectsForCustomer(customer, active, pageRequest);
        return new ResponseEntity<>(projectsPage, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<CustomerProject> getCustomerProject(@PathVariable long id) {
        Customer customer = userSecurityService.currentCustomer();
        CustomerProject project = customerProjectService.getCustomerProject(id, customer);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE + PROJECT_REQUESTS)
    public ResponseEntity<List<CompanyProjectRequest>> getProjectRequests(@PathVariable long id) {
        Customer customer = userSecurityService.currentCustomer();
        List<CompanyProjectRequest> projectRequests = customerProjectService.getProjectRequests(customer, id);
        return new ResponseEntity<>(projectRequests, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<CloseProjectQuestionary> getCloseVariants(@PathVariable long id) {
        Project project = getProject(id);
        List<NameIdImageTuple> potentialExecutors = customerProjectService.getPotentialExecutors(project);
        return new ResponseEntity<>(new CloseProjectQuestionary(potentialExecutors), HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<Void> closeProject(@PathVariable long id, @RequestBody @Valid CloseProjectRequest request) {
        Project project = getProject(id);
        customerProjectService.closeProject(project, request);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    private Project getProject(Long id) {
        Customer customer = userSecurityService.currentCustomer();
        return projectRepository.findByIdAndCustomerId(id, customer.getId())
            .orElseThrow(NotFoundException::new);
    }
}
