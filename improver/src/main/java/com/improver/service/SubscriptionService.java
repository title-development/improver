package com.improver.service;

import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Project;
import com.improver.entity.Subscription;
import com.improver.entity.Transaction;
import com.improver.exception.PaymentFailureException;
import com.improver.repository.BillRepository;
import com.improver.repository.TransactionRepository;
import com.improver.application.properties.BusinessProperties;
import com.improver.util.serializer.SerializationUtil;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Service
public class SubscriptionService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private BillRepository billRepository;
    @Autowired private PaymentService paymentService;
    @Autowired private MailService mailService;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private LeadService leadService;
    @Autowired private BusinessProperties businessProperties;


    public Billing subscribe(Contractor contractor, Company company, int budget, int timeZoneOffset) {
        ZoneOffset userZoneOffset = ZoneOffset.ofTotalSeconds(timeZoneOffset * 60);
        Billing billing = company.getBilling();
        Subscription subscription = billing.getSubscription();
        boolean isNewSubscription = !subscription.isActive();
        if (isNewSubscription) {
            log.info("New Subscription");
            newWithBudget(budget, subscription);
            if(billing.getBalance() < budget){
                paymentService.autoChargeForSubscription(company, budget - billing.getBalance(), budget);
            } else {
                logBalanceSubscription(company, budget);
            }
            log.info("Company={} is subscribed for {}", company.getId(), SerializationUtil.formatUsd(budget));

        }
        // new Subscription
        else {
            if(!subscription.isAutoContinue()) {
                log.info("Resubscription");
                subscription.setAutoContinue(true);
            } else {
                log.info("Updating existing subscription");
            }
            subscription.setNextBudget(budget)
                .setUpdated(ZonedDateTime.now());
            log.info("Company={} updated subscription for {} starting from {}", company.getId(), SerializationUtil.formatUsd(budget), subscription.getNextBillingDate().toLocalDate());
        }

        Billing updatedBilling = billRepository.save(billing.setSubscription(subscription));
        if (isNewSubscription) {
            leadService.sendSubscriptionLead(company);
        }
        mailService.sendSubscriptionNotification(company, timeZoneOffset, isNewSubscription);
        return updatedBilling;
    }


    public void prolongSubscription(Billing billing){
        Company company = billing.getCompany();
        log.info("Subscription Prolongation for company={}", company.getName());
        String comment = null;
        Subscription subscription = billing.getSubscription();
        int budget = subscription.getNextBudget();
        int toCharge = budget - billing.getBalance();

        try {
            if(toCharge > 0) {
                billing = paymentService.autoChargeForSubscription(company, toCharge, budget);
                comment = "Charged "+ SerializationUtil.formatUsd(budget) + " to card to fulfill Subscription Budget of $ " + SerializationUtil.centsToUsd(budget);
            } else {
                comment = "Reserved "+ SerializationUtil.formatUsd(budget) + " on balance for Subscription Budget of $ " + SerializationUtil.centsToUsd(budget);
                logBalanceSubscription(company, budget);
            }
            log.info("Company={} | " + comment, company.getName());
            prolong(subscription);
            billRepository.save(billing);
            mailService.sendSubscriptionProlongation(company, toCharge, budget, subscription.getNextBillingDate());
        } catch (PaymentFailureException e){
            log.error("Subscription payment failure for company=" + company.getName(), e);
            ZonedDateTime endDate = subscription.getNextBillingDate();
            int failures = subscription.getChargeFailureCount() +1;
            boolean tryAgain = (failures <= BusinessProperties.SUBSCRIPTION_CHARGE_ATTEMPTS);
            if (tryAgain) {
                subscription.setChargeFailureCount(failures);
                billRepository.save(billing);
            }
            else {
                subscription.reset();
                billRepository.save(billing);
                log.info("Subscription automatically canceled for company=" + company.getName());
            }
            mailService.sendSubscriptionProlongationFailure(company, endDate, budget, tryAgain);
        } catch (Exception e){
            log.error("Could not proceed subscription payment for company=" + company.getName(), e);
        }
    }


    public void cancelSubscription(Company company, int timeZoneOffset) {
        Billing billing = company.getBilling();

        if (!billing.getSubscription().isActive()) {
            log.info("Subscription for company={} is already disabled", company.getId());
        } else {
            log.info("Company={} canceled subscription", company.getId());
            billing.getSubscription().cancel();
            billRepository.save(billing);
            mailService.sendSubscriptionCancel(company, timeZoneOffset);
        }
    }

    private void logBalanceSubscription(Company company, int budget) {
        transactionRepository.save(Transaction.subscriptionBalance(
            company,
            "Submitted subscription of " + SerializationUtil.formatUsd(budget),
            company.getBilling().getBalance())
        );
    }

    private void newWithBudget(int budget, Subscription subscription) {
        ZonedDateTime now = ZonedDateTime.now();
        subscription.setActive(true)
            .setAutoContinue(true)
            .setStartBillingDate(now)
            .setNextBillingDate(now.plus(businessProperties.getSubscriptionPeriod()))
            .setBudget(budget)
            .setNextBudget(budget)
            .setReserve(budget)
            .setCreated(now)
            .setUpdated(now);
    }

    private void prolong(Subscription subscription) {
        ZonedDateTime start = subscription.getNextBillingDate();
        subscription.setStartBillingDate(start)
            .setBudget(subscription.getNextBudget())
            .setNextBudget(subscription.getNextBudget())
            .setReserve(subscription.getNextBudget())
            .setNextBillingDate(subscription.getNextBillingDate().plus(businessProperties.getSubscriptionPeriod()))
            .setActive(true)
            .setAutoContinue(true)
            .setChargeFailureCount(0);
    }
}
