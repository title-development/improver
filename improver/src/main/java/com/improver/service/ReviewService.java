package com.improver.service;

import com.improver.application.properties.BusinessProperties;
import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.out.CompanyReview;
import com.improver.model.out.CompanyReviewRevision;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import com.improver.ws.WsNotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.ZonedDateTime;

@Slf4j
@Service
public class ReviewService {

    @Autowired private CompanyRepository companyRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private MailService mailService;
    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired private ReviewRequestRepository reviewRequestRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private ReviewRevisionRequestRepository reviewRevisionRequestRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;

    public Page<CompanyReview> getAll(Long id, String customerName, String companyName, Pageable pageable) {
        return reviewRepository.getAll(id, customerName, companyName, pageable);
    }

    public Page<CompanyReview> getReviews(String companyId, boolean publishedOnly, Pageable pageable) {
        User user = userSecurityService.currentUserOrNull();
        long requesterId = 0;

        if (user != null && !publishedOnly) {
            requesterId = user.getId();
        }

        return reviewRepository.getVisibleReviews(companyId, requesterId, ZonedDateTime.now(), pageable);
    }


    @Deprecated
    public void addTestReview(Review review) {
        Company company = review.getCompany();
        ProjectRequest projectRequest = review.getProjectRequest();
        if (projectRequest != null) {
            projectRequestRepository.save(projectRequest.setReview(review));
        } else {
            reviewRepository.save(review);
        }
        int reviewCount = company.getReviewCount() + 1;
        long sumRating = company.getSumRating() + review.getScore();
        double rating = (double) sumRating / reviewCount;
        companyRepository.save(company.setReviewCount(reviewCount).setRating(rating).setSumRating(sumRating));
        mailService.sendNewReviewReceivedMail(company, review);
    }

    @Transactional
    public void addReview(Review review, String reviewToken, Customer customer) {
        boolean isNegative = review.getScore() <= BusinessProperties.NEGATIVE_REVIEW_RATING_LIMIT;
        Company company = review.getCompany();
        ProjectRequest projectRequest = review.getProjectRequest();

        if (isNegative) {
            review.setPublishDate(ZonedDateTime.now().plusDays(BusinessProperties.NEGATIVE_REVIEW_PREPUBLISH_DAYS));
        } else {
            review.setPublishDate(ZonedDateTime.now());
            review.setPublished(true);
            updateCompanyRating(company, review);
        }

        if (projectRequest != null) {
            projectRequestRepository.save(projectRequest.setReview(review));
        } else {
            reviewRepository.save(review);
        }

        if(isNegative) {
            mailService.sendNewNegativeReviewMail(company, review, customer);
            company.getContractors()
                .forEach(contractor -> wsNotificationService.reviewedNegative(contractor, review.getCustomer(), company.getId()));
        } else {
            mailService.sendNewReviewReceivedMail(company, review);
            company.getContractors()
                .forEach(contractor -> wsNotificationService.reviewed(contractor, review.getCustomer(), company.getId()));
        }

        if (reviewToken != null) {
            ReviewRequest requestReview = reviewRequestRepository.findByReviewToken(reviewToken).orElseThrow(NotFoundException::new);
            requestReview.setCompleted(true);
            reviewRequestRepository.save(requestReview);
        }
    }

    public void updateCompanyRating(Company company, Review review) {
        int reviewCount = company.getReviewCount() + 1;
        long sumRating = company.getSumRating() + review.getScore();
        double rating = (double) sumRating / reviewCount;
        companyRepository.save(company.setReviewCount(reviewCount).setRating(rating).setSumRating(sumRating));
    }

    public Review checkReview(long projectRequestId, Customer customer, String companyId, String reviewToken) throws NotFoundException, ValidationException, ConflictException {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        ProjectRequest projectRequest = null;
        if (projectRequestId > 0) {
            projectRequest = projectRequestRepository.findByIdAndCustomerId(projectRequestId, customer.getId())
                .orElseThrow(NotFoundException::new);
            if (!ProjectRequest.Status.HIRED.equals(projectRequest.getStatus()) && !ProjectRequest.Status.COMPLETED.equals(projectRequest.getStatus())) {
                throw new ConflictException("You can review only after you hire pro");
            }
            if (projectRequest.getReview() != null) {
                throw new ConflictException("Review for this project already exist");
            }
        } else {
            ReviewRequest requestReview = reviewRequestRepository.findByReviewToken(reviewToken).orElseThrow(NotFoundException::new);
            if (requestReview.isCompleted()) {
                throw new ValidationException("You already reviewed the company");
            }

            if (!customer.getEmail().equals(requestReview.getCustomerEmail())) {
                throw new ValidationException("Review token is invalid");
            }

            if (!companyId.equals(requestReview.getCompanyId())) {
                throw new ValidationException("You should have request for review or hire this pro");
            }
        }
        return new Review().setCompany(company).setProjectRequest(projectRequest).setCustomer(customer);
    }

    public void requestReviewRevision(Company company, Review review, String comment) {
        ServiceType serviceType = serviceTypeRepository.findByProjectsProjectRequestsReviewId(review.getId());
        mailService.sendReviewRevisionRequest(company, review, serviceType.getName(), comment);
        reviewRevisionRequestRepository.save(new ReviewRevisionRequest().setComment(comment).setReview(review));
    }


    public CompanyReviewRevision getReviewForRevision(long reviewId, Customer customer) throws NotFoundException, ConflictException {
        CompanyReviewRevision companyReviewRevision = reviewRepository.findByCustomerAndId(customer, reviewId).orElseThrow(NotFoundException::new);
        if(companyReviewRevision.isPublished()) {
            throw new ConflictException("Review already published");
        }
        return  companyReviewRevision;
    }

    public void updateReview(Long reviewId, CompanyReviewRevision toUpdateReview) {
        boolean isRevised = toUpdateReview != null;
        Review review = reviewRepository.findById(reviewId).orElseThrow(NotFoundException::new);
        if (isRevised && review.getScore() > toUpdateReview.getScore()) {
            throw new ConflictException("You cannot rate lower than original review");
        }
        Company company = review.getCompany();
        review.setPublished(true);
        review.setPublishDate(ZonedDateTime.now());
        if (isRevised) {
            review.setDescription(toUpdateReview.getDescription());
            review.setScore(toUpdateReview.getScore());
        } else {
            reviewRevisionRequestRepository.save(review.getReviewRevisionRequest().setDeclined(true));
        }
        reviewRepository.save(review);
        updateCompanyRating(review.getCompany(), review);
        company.getContractors()
            .forEach(contractor -> wsNotificationService.reviewPublished(contractor, review.getCustomer(), company.getId()));
        mailService.sendReviewPublishedMail(company, review);
    }

    public void declineReviewRevision(Long reviewId) throws NotFoundException {
        updateReview(reviewId, null);
    }
}
