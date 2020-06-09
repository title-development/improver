package com.improver.job;

import com.improver.application.properties.BusinessProperties;
import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.repository.BillRepository;
import com.improver.repository.CompanyRepository;
import com.improver.service.SubscriptionService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.SchedulerLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoField;
import java.time.temporal.ChronoUnit;
import java.util.List;


@Slf4j
@Component
public class SubscriptionBillingJob implements OnesPerNodeTask {

    public static final long MAX_SUBSCRIPTION_BILLING_JOB_DELAY = 120000; //2 mins
    @Autowired private BillRepository billRepository;
    @Autowired private MailService mailService;
    @Autowired private SubscriptionService subscriptionService;
    @Autowired private BusinessProperties businessProperties;
    @Autowired private CompanyRepository companyRepository;



    @Scheduled(cron = "${job.subscription.billing.cron}")
    @SchedulerLock(name = "updateSubscription", lockAtLeastFor = MAX_CLOCK_DIFF_BETWEEN_NODES, lockAtMostFor = MAX_SUBSCRIPTION_BILLING_JOB_DELAY)
    public void updateSubscription(){
        log.info("Job 2 started => Subscription billing");
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime endOfDay = now.plus(1, ChronoUnit.DAYS).with(ChronoField.HOUR_OF_DAY, 0);
        List<Company> companies = companyRepository.findSubscriptionCandidates(endOfDay);
        companies.forEach(company -> checkBill(company, now));
        log.info("Job 2 ended   <= Subscription billing");
    }


    private void checkBill(Company company, ZonedDateTime now){
        Billing billing = company.getBilling();
        ZonedDateTime billingDate = billing.getSubscription().getNextBillingDate()
            .truncatedTo(businessProperties.getSubsBillingDateTruncate());

        if (now.isAfter(billingDate)) {
            if(billing.getSubscription().isAutoContinue()){
              subscriptionService.prolongSubscription(billing);
            } else {
                billing.getSubscription().reset();
                billRepository.save(billing);
                mailService.sendSubscriptionEnded(company);
            }
        }
    }



}
