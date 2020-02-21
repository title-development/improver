package com.improver.controller;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.model.in.CustomerReview;
import com.improver.model.in.ProRequestReview;
import com.improver.model.out.review.*;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ReviewRepository;
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
import javax.validation.constraints.Size;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.Path.REVIEWS;
import static com.improver.util.database.DataAccessUtil.REVIEW_MESSAGE_MAX_SIZE;
import static com.improver.util.database.DataAccessUtil.REVIEW_MESSAGE_MIN_SIZE;

@Slf4j
@RestController
public class ReviewController {

    @Autowired ReviewService reviewService;
    @Autowired UserSecurityService userSecurityService;
    @Autowired ReviewRequestService requestReviewService;
    @Autowired ReviewRevisionRequestRepository reviewRevisionRequestRepository;
    @Autowired CompanyRepository companyRepository;
    @Autowired ReviewRepository reviewRepository;

    @SupportAccess
    @PageableSwagger
    @GetMapping(REVIEWS_PATH)
    public ResponseEntity<Page<CompanyReview>> getAll(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String customerName,
        @RequestParam(required = false) String companyName,
        @RequestParam(required = false) Integer scoreFrom,
        @RequestParam(required = false) Integer scoreTo,
        @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<CompanyReview> reviews = reviewRepository.findAllBy(id, customerName, companyName, scoreFrom, scoreTo, pageRequest);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @PostMapping(REVIEWS_PATH + REQUEST)
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<Void> requestReview(@RequestBody @Valid ProRequestReview proRequestReview) {
        Contractor pro = userSecurityService.currentPro();
        requestReviewService.sendCompanyReviewRequest(pro, proRequestReview);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping(REVIEWS_PATH + REQUEST + OPTIONS)
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<ReviewRequestOption> getAvailableReviewRequest(){
        Contractor pro = userSecurityService.currentPro();
        ReviewRequestOption reviewRequestOption = reviewService.getReviewRequestOptions(pro);
        return new ResponseEntity<>(reviewRequestOption, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(REVIEWS_PATH + ID_PATH_VARIABLE)
    public ResponseEntity<CompanyReviewRevision> getReviewById(@PathVariable long id) {
        Customer customer = userSecurityService.currentCustomer();
        CompanyReviewRevision reviewForRevision = reviewService.getReviewForRevision(id, customer);
        return new ResponseEntity<>(reviewForRevision, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping(REVIEWS_PATH + ID_PATH_VARIABLE + DECLINE)
    public ResponseEntity<Void> declineReviewRevision(@PathVariable long id) {
        reviewService.declineReviewRevision(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping(REVIEWS_PATH + ID_PATH_VARIABLE+ ACCEPT)
    public ResponseEntity<Void> acceptReviewRevision(@PathVariable long id, @RequestBody CompanyReviewRevision review) {
        reviewService.updateReview(id, review);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(REVIEWS_PATH + ID_PATH_VARIABLE + REVISION)
    public ResponseEntity<ReviewRevision> getRevisionRequest(@PathVariable long id) {
        ReviewRevision reviewRevision = reviewRevisionRequestRepository.findByReviewId(id).orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(reviewRevision, HttpStatus.OK);
    }



    //=========================================================================

    @PreAuthorize("hasRole('CONTRACTOR')")
    @PostMapping(REVIEWS_PATH + ID_PATH_VARIABLE + REVISION)
    public ResponseEntity<Void> requestReviewRevision(@PathVariable Long id,
                                                      @RequestBody
                                                      @Size(min = REVIEW_MESSAGE_MIN_SIZE, max = REVIEW_MESSAGE_MAX_SIZE, message = "Message should be " + REVIEW_MESSAGE_MIN_SIZE + " to " + REVIEW_MESSAGE_MAX_SIZE + " characters long.")
                                                          String comment) {
        Contractor pro = userSecurityService.currentPro();
        Company company = pro.getCompany();
        Review review = reviewRepository.findByIdAndCompany(id, company)
            .orElseThrow(NotFoundException::new);
        reviewService.requestReviewRevision(company, review, comment);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PageableSwagger
    @GetMapping(COMPANIES_PATH + COMPANY_ID + REVIEWS)
    public ResponseEntity<ReviewRating> getCompanyReviews(@PathVariable long companyId, @RequestParam(defaultValue = "false") boolean publishedOnly,
                                                          @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Page<CompanyReview> reviewsPage = reviewService.getReviews(companyId, publishedOnly, pageRequest);
        ReviewRating reviewRating = new ReviewRating(company.getRating(), reviewsPage);
        return new ResponseEntity<>(reviewRating, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(COMPANIES_PATH + COMPANY_ID + REVIEWS + OPTIONS)
    public ResponseEntity<Void> getReviewCapability(@PathVariable long companyId,
                                                    @RequestParam(defaultValue = "0") long projectRequestId,
                                                    @RequestParam(required = false) String reviewToken) {

        Customer customer = userSecurityService.currentCustomer();
        reviewService.checkReview(projectRequestId, customer, companyId, reviewToken);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(COMPANIES_PATH + COMPANY_ID + REVIEWS)
    public ResponseEntity<Void> addReview(@PathVariable long companyId,
                                          @RequestParam(defaultValue = "0") long projectRequestId,
                                          @RequestParam(required = false) String reviewToken,
                                          @RequestBody @Valid CustomerReview review) {

        Customer customer = userSecurityService.currentCustomer();
        Review companyReview = reviewService.checkReview(projectRequestId, customer, companyId, reviewToken);
        reviewService.addReview(companyReview.setScore(review.getScore()).setDescription(review.getDescription()), reviewToken, customer);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
