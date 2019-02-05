package com.improver.controller;

import com.improver.entity.*;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.NotFoundException;
import com.improver.model.admin.out.AdminProjectRequest;
import com.improver.model.out.MessengerDocument;
import com.improver.model.out.project.CompanyProjectRequest;
import com.improver.model.in.DeclineProAction;
import com.improver.repository.ProjectRequestRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.ProjectRequestService;
import com.improver.service.DocumentService;
import com.improver.security.annotation.SupportAccess;
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

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;

import static com.improver.application.properties.Path.*;


@RestController
@RequestMapping(PROJECT_REQUESTS_PATH)
public class ProjectRequestController {

    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ProjectRequestService projectRequestService;
    @Autowired private DocumentService fileService;
    @Autowired private UserSecurityService userSecurityService;

    @SupportAccess
    @GetMapping
    public ResponseEntity<Page<AdminProjectRequest>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String contractorEmail,
        @RequestParam(required = false) String customerEmail,
        @RequestParam(required = false) ProjectRequest.Status status,
        @RequestParam(required = false) Project.Status projectStatus,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {

        Page<AdminProjectRequest> projectRequests = projectRequestRepository.getAll(id, contractorEmail, customerEmail, status, projectStatus, pageRequest);
        return new ResponseEntity<>(projectRequests, HttpStatus.OK);
    }


    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR', 'ADMIN', 'SUPPORT')")
    @GetMapping(ID_PATH_VARIABLE + "/messages")
    public ResponseEntity<List<ProjectMessage>> getChatMessages(@PathVariable long id) {
        User user = userSecurityService.currentUser();
        List<ProjectMessage> messages = projectRequestService.getProjectMessages(id, user);
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }


    //TODO: Refactor this: Add security
    @Deprecated
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CONTRACTOR')")
    @PostMapping("/documents")
    public ResponseEntity<MessengerDocument> uploadFile(MultipartFile file) {
        Document savedFile = fileService.saveFile(file);
        String fileUrl = DOCUMENTS_PATH + SLASH + savedFile.getName();
        MessengerDocument messengerFile = new MessengerDocument(savedFile.getOriginalName(), fileUrl);
        return new ResponseEntity<>(messengerFile, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<CompanyProjectRequest> getProjectRequest(@PathVariable long id) {
        Customer customer = userSecurityService.currentCustomer();
        CompanyProjectRequest companyProjectRequest = projectRequestRepository.getCompanyProjectRequest(id, String.valueOf(customer.getId()))
            .orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(companyProjectRequest, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(ID_PATH_VARIABLE + "/decline")
    public ResponseEntity<Map<ProjectRequest.Reason, String>> getDeclineVariants(@PathVariable long id) {
        ProjectRequest projectRequest = getForCurrentCustomer(id);
        Map<ProjectRequest.Reason, String> options = projectRequestService.getDeclineOptions(projectRequest);
        return new ResponseEntity<>(options, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(ID_PATH_VARIABLE + "/hire")
    public ResponseEntity<Void> hirePro(@PathVariable long id, @RequestParam(defaultValue = "true") boolean declineOthers) {
        ProjectRequest projectRequest = getForCurrentCustomer(id);
        projectRequestService.hirePro(projectRequest);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(ID_PATH_VARIABLE + "/decline")
    public ResponseEntity<Void> declinePro(@PathVariable long id, @RequestBody DeclineProAction action) {
        ProjectRequest projectRequest = getForCurrentCustomer(id);
        projectRequestService.declinePro(projectRequest, action.getReason(), action.getComment());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @PreAuthorize("hasRole('CONTRACTOR')")
    @PostMapping(ID_PATH_VARIABLE + "/close")
    public ResponseEntity<Void> leaveProject(@PathVariable long id, @RequestParam boolean leave) {
        ProjectRequest projectRequest = getForCurrentPro(id);
        projectRequestService.closeProject(projectRequest, ZonedDateTime.now(), leave);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    private ProjectRequest getForCurrentCustomer(long projectRequestId) {
        Customer customer = userSecurityService.currentCustomer();
        return projectRequestRepository.findByIdAndCustomerId(projectRequestId, customer.getId())
            .orElseThrow(AccessDeniedException::new);
    }

    private ProjectRequest getForCurrentPro(long projectRequestId) {
        Contractor contractor = userSecurityService.currentPro();
        return projectRequestRepository.findByIdAndContractorId(projectRequestId, contractor.getId()).
            orElseThrow(AccessDeniedException::new);
    }

}
