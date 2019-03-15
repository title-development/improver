package com.improver.job;

import com.improver.entity.Company;
import com.improver.repository.ReviewRepository;
import com.improver.ws.WsNotificationService;
import com.improver.service.ReviewService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.SchedulerLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.ZonedDateTime;

@Slf4j
@Component
public class ReviewPublishingJob {

    public static final int REVIEW_PUBLISHING_LOCK = 60 * 1000;

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ReviewService reviewService;
    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired private MailService mailService;

    @Scheduled(cron = "${review.publishing.cron}")
    @SchedulerLock(name = "publishReview", lockAtLeastFor = REVIEW_PUBLISHING_LOCK, lockAtMostFor = REVIEW_PUBLISHING_LOCK)
    public void publishReview(){
        log.info("Review publishing Job started");
        ZonedDateTime now = ZonedDateTime.now();
        reviewRepository.getForPublishing(now).forEach(review -> {
            Company company = review.getCompany();
            reviewService.updateCompanyRating(company, review);
            reviewRepository.save(review.setPublished(true));
            company.getContractors()
                .forEach(contractor -> wsNotificationService.reviewPublished(contractor, review.getCustomer(), company.getId()));
            mailService.sendReviewPublishedMail(company, review);
            log.debug("Review " + review.getId() + " is published");
        });
        log.info("Review publishing Job ended");
    }




}
