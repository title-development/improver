package com.improver.job;

import com.improver.application.properties.BusinessProperties;
import com.improver.entity.Billing;
import com.improver.repository.BillRepository;
import com.improver.service.SubscriptionService;
import com.improver.util.mail.MailService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.SchedulerLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.util.List;


@Slf4j
@Component
public class SubscriptionUpdateJob {

    public static final int SUBSCRIPTION_UPDATE_LOCK = 60 * 1000;

    @Autowired private BillRepository billRepository;
    @Autowired private MailService mailService;
    @Autowired private SubscriptionService subscriptionService;
    @Autowired private BusinessProperties businessProperties;

    @Scheduled(cron = "${subscription.update.cron}")
    @SchedulerLock(name = "updateSubscription", lockAtLeastFor = SUBSCRIPTION_UPDATE_LOCK, lockAtMostFor = SUBSCRIPTION_UPDATE_LOCK)
    public void updateSubscription(){
        log.info("Subscription update Job started");
        ZonedDateTime now = ZonedDateTime.now();
        List<Billing> bills = billRepository.findBySubscription();
        bills.forEach(billing -> checkBill(billing, now));
        log.info("Subscription update Job ended");
    }


    private void checkBill(Billing billing, ZonedDateTime now){
        ZonedDateTime billingDate = billing.getSubscription().getNextBillingDate()
            .truncatedTo(businessProperties.getSubsBillingDateTruncate());

        if (now.isAfter(billingDate)) {
            if(billing.getSubscription().isAutoContinue()){
              subscriptionService.prolongSubscription(billing);
            } else {
                billing.getSubscription().reset();
                billRepository.save(billing);
                mailService.sendSubscriptionExpired(billing.getCompany());
            }
        }
    }



}
