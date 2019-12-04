package com.improver.service;

import com.improver.entity.Shedlock;
import com.improver.exception.ConflictException;
import com.improver.job.OnesPerNodeTask;
import com.improver.job.ReviewPublishingJob;
import com.improver.job.SubscriptionBillingJob;
import com.improver.repository.ShedlockRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.time.Duration;
import java.time.ZonedDateTime;

@Slf4j
@Service
public class ManualRunJobService {

    @Autowired private SubscriptionBillingJob subscriptionUpdateJob;
    @Autowired private ReviewPublishingJob reviewPublishingJob;
    @Autowired private ShedlockRepository shedlockRepository;

    public void runUpdateSubscription() {
        Shedlock shedlock = shedlockRepository.findByName("updateSubscription");

        if(shedlock == null || !ZonedDateTime.now().isAfter(shedlock.getLockUntil())) {
            throw new ConflictException("Update Subscription Job is locked for a while. Please try again later.");
        }
        shedlock.setLockedAt(ZonedDateTime.now())
            .setLockUntil(ZonedDateTime.now().plus(Duration.ofMillis(SubscriptionBillingJob.MAX_SUBSCRIPTION_BILLING_JOB_DELAY)));
        try {
            shedlock.setLockedBy(InetAddress.getLocalHost().getHostName());
        } catch (UnknownHostException e) {
            log.error(e.getMessage(), e);
        }
        shedlockRepository.save(shedlock);
        subscriptionUpdateJob.updateSubscription();
    }

    public void runPublishReview() {
        Shedlock shedlock = shedlockRepository.findByName("publishReview");

        if(shedlock == null || !ZonedDateTime.now().isAfter(shedlock.getLockUntil())) {
            throw new ConflictException("Publish Review Job is locked for a while. Please try again later.");
        }
        shedlock.setLockedAt(ZonedDateTime.now())
            .setLockUntil(ZonedDateTime.now().plus(Duration.ofMillis(OnesPerNodeTask.MAX_TASK_DELAY)));
        try {
            shedlock.setLockedBy(InetAddress.getLocalHost().getHostName());
        } catch (UnknownHostException e) {
            log.error(e.getMessage(), e);
        }
        shedlockRepository.save(shedlock);
        reviewPublishingJob.publishReview();
    }

}
