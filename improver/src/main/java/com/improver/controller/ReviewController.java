package com.improver.controller;

import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.entity.Review;
import com.improver.entity.ReviewRevisionRequest;
import com.improver.exception.NotFoundException;
import com.improver.model.in.ProRequestReview;
import com.improver.model.out.CompanyReview;
import com.improver.model.out.CompanyReviewRevision;
import com.improver.model.out.ReviewRevision;
import com.improver.repository.ReviewRevisionRequestRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.ReviewRequestService;
import com.improver.service.ReviewService;
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

import javax.validation.Valid;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.REVIEWS_PATH;

@Slf4j
@RestController
@RequestMapping(REVIEWS_PATH)
public class ReviewController {

    @Autowired ReviewService reviewService;
    @Autowired UserSecurityService userSecurityService;
    @Autowired ReviewRequestService requestReviewService;
    @Autowired ReviewRevisionRequestRepository reviewRevisionRequestRepository;

    @SupportAccess
    @PageableSwagger
    @GetMapping
    public ResponseEntity<Page<CompanyReview>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String customerName,
        @RequestParam(required = false) String companyName,
        @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<CompanyReview> reviews = reviewService.getAll(id, customerName, companyName, pageRequest);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Void> requestReview(@RequestBody @Valid ProRequestReview proRequestReview) {
        Contractor pro = userSecurityService.currentPro();
        requestReviewService.notifyUsers(pro, proRequestReview);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<CompanyReviewRevision> getReviewById(@PathVariable long id) {
        Customer customer = userSecurityService.currentCustomer();
        CompanyReviewRevision reviewForRevision = reviewService.getReviewForRevision(id, customer);
        return new ResponseEntity<>(reviewForRevision, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping(ID_PATH_VARIABLE + "/decline")
    public ResponseEntity<Void> declineReviewRevision(@PathVariable long id) {
        reviewService.declineReviewRevision(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping(ID_PATH_VARIABLE+ "/accept")
    public ResponseEntity<Void> acceptReviewRevision(@PathVariable long id, @RequestBody CompanyReviewRevision review) {
        reviewService.updateReview(id, review);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(ID_PATH_VARIABLE + "/revision")
    public ResponseEntity<ReviewRevision> getRevisionRequest(@PathVariable long id) {
        ReviewRevision reviewRevision = reviewRevisionRequestRepository.findByReviewId(id).orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(reviewRevision, HttpStatus.OK);
    }




}
