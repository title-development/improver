package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.ProjectRequest;
import com.improver.entity.Contractor;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.out.Receipt;
import com.improver.model.out.RefundQuestionary;
import com.improver.security.UserSecurityService;
import com.improver.service.BillingService;
import com.improver.model.out.RefundResult;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.model.out.project.ProjectRequestDetailed;
import com.improver.model.in.RefundRequest;
import com.improver.repository.ProjectRequestRepository;
import com.improver.service.ProjectService;
import com.improver.service.RefundService;
import com.improver.util.annotation.PageableSwagger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.*;

@PreAuthorize("hasRole('CONTRACTOR')")
@RestController
@RequestMapping(PROS_PATH + PROJECTS)
public class ContractorProjectController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private ProjectService projectService;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private RefundService refundService;
    @Autowired private BillingService billingService;


    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<ProjectRequestShort>> getContractorProjects(@RequestParam(defaultValue = "true") boolean latest,
                                                                           @RequestParam(required = false) String search,
                                                                           @PageableDefault(sort = "created", page = 0, size = 10, direction = Sort.Direction.DESC) Pageable pageRequest) {
        Contractor contractor = userSecurityService.currentPro();
        Page<ProjectRequestShort> projectsPage = projectService.getProjectsForProDashboard(contractor, latest, search, pageRequest);
        return new ResponseEntity<>(projectsPage, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<ProjectRequestDetailed> getContractorProject(@PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        ProjectRequestDetailed projectRequest = projectService.getContractorProject(id, contractor.getId());
        return new ResponseEntity<>(projectRequest, HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE + "/receipt")
    public ResponseEntity<Receipt> getReceipt(@PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        Company company = contractor.getCompany();
        Receipt receipt = billingService.getReceipt(company, id);
        return new ResponseEntity<>(receipt, HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + REFUND)
    public ResponseEntity<Void> requestRefund(@PathVariable long id, @RequestBody RefundRequest refundRequest) {
        Contractor contractor = userSecurityService.currentPro();
        ProjectRequest projectRequest = projectRequestRepository.findByIdAndContractorId(id, contractor.getId())
            .orElseThrow(NotFoundException::new);
        refundService.register(refundRequest, projectRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE + REFUND)
    public ResponseEntity<RefundResult> getRefundResult(@PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        ProjectRequest projectRequest = projectRequestRepository.findByIdAndContractorId(id, contractor.getId())
            .orElseThrow(() -> new ValidationException("Project not exist"));
        RefundResult result = refundService.get(projectRequest);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping(value = ID_PATH_VARIABLE + REFUND + OPTIONS)
    public ResponseEntity<RefundQuestionary> getRefundOptions(@PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        projectRequestRepository.findByIdAndContractorId(id, contractor.getId())
            .orElseThrow(() -> new ValidationException("Project not exist"));
        RefundQuestionary questionary = refundService.buildQuestionary(id);
        return new ResponseEntity<>(questionary, HttpStatus.OK);
    }

}
