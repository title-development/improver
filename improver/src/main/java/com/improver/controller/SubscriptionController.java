package com.improver.controller;

import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Subscription;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.out.CompanyLeadsReport;
import com.improver.model.out.billing.SubscriptionInfo;
import com.improver.repository.BillRepository;
import com.improver.repository.CompanyRepository;
import com.improver.repository.TransactionRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import com.improver.service.BillingService;
import com.improver.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

import static com.improver.application.properties.BusinessProperties.MIN_SUBSCRIPTION;
import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.Path.COMPANY_ID;

@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID)
public class SubscriptionController {

    @Autowired private BillingService billingService;
    @Autowired private SubscriptionService subscriptionService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private TransactionRepository transactionRepository;


    @CompanyMemberOrSupportAccess
    @GetMapping(SUBSCRIPTION)
    public ResponseEntity<SubscriptionInfo> getSubscription(@PathVariable long companyId) {
        Billing billing = billRepository.findByCompanyId(companyId)
            .orElseThrow(NotFoundException::new);

        Subscription subscription = Optional.ofNullable(billing.getSubscription())
            .orElse(new Subscription());
        int dealsCount = 0;
        if(subscription.isActive()){
            dealsCount = transactionRepository.countSubscriptionPurchasesForPeriod(companyId, subscription.getStartBillingDate(), subscription.getNextBillingDate());
        }
        return new ResponseEntity<>(new SubscriptionInfo(subscription, dealsCount), HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PutMapping(SUBSCRIPTION)
    public ResponseEntity<Subscription> subscribe(@PathVariable long companyId,
                                                  @RequestParam int budget,
                                                  @RequestHeader int timeZoneOffset) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if (budget < MIN_SUBSCRIPTION) {
            throw new ValidationException("Minimum budget is 100");
        }
        Contractor contractor = userSecurityService.currentPro();
        Subscription subscription = subscriptionService.subscribe(contractor, company, budget, timeZoneOffset).getSubscription();
        return new ResponseEntity<>(subscription, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @DeleteMapping(SUBSCRIPTION)
    public ResponseEntity<Void> unsubscribe(@PathVariable long companyId, @RequestHeader int timeZoneOffset) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        subscriptionService.cancelSubscription(company, timeZoneOffset);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @GetMapping(LEADS + "/report")
    public ResponseEntity<CompanyLeadsReport> getCompanyLeadsReport(@PathVariable long companyId) {
        CompanyLeadsReport companyLeadsReport = billingService.getCompanyLeadsReport(companyId);
        return new ResponseEntity<>(companyLeadsReport, HttpStatus.OK);
    }
}
