package com.improver.controller;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.out.*;
import com.improver.repository.TransactionRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.CompanyMember;
import com.improver.service.*;
import com.improver.model.in.StripeToken;
import com.improver.repository.BillRepository;
import com.improver.repository.CompanyRepository;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static com.improver.application.properties.BusinessProperties.MIN_SUBSCRIPTION;
import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID)
public class BillingController {

    @Autowired private BillingService billingService;
    @Autowired private SubscriptionService subscriptionService;
    @Autowired private PaymentService paymentService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private CompanyService companyService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private TransactionRepository transactionRepository;



    @CompanyMemberOrSupportAccess
    @GetMapping("/balance")
    public ResponseEntity<Integer> getBalance(@PathVariable String companyId) {
        Billing billing = billRepository.findByCompanyId(companyId)
            .orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(billing.getBalance(), HttpStatus.OK);
    }


    @AdminAccess
    @PostMapping("/bonus")
    public ResponseEntity<Void> addBonus(@PathVariable String companyId, @RequestBody int amount) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        billingService.addBonus(company, amount, null);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @GetMapping(SUBSCRIPTION)
    public ResponseEntity<SubscriptionInfo> getSubscription(@PathVariable String companyId) {
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
    public ResponseEntity<Subscription> subscribe(@PathVariable String companyId,
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
    public ResponseEntity<Void> unsubscribe(@PathVariable String companyId, @RequestHeader int timeZoneOffset) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        subscriptionService.cancelSubscription(company, timeZoneOffset);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PageableSwagger
    @GetMapping(TRANSACTIONS)
    public ResponseEntity<Page<Transaction>> getCompanyTransactions(@PathVariable String companyId,
                                                                    @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Page<Transaction> transactionsPage = companyService.getTransactions(companyId, pageRequest);
        return new ResponseEntity<>(transactionsPage, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PageableSwagger
    @GetMapping(TRANSACTIONS + ID_PATH_VARIABLE)
    public ResponseEntity<Receipt> getReceipt(@PathVariable String companyId, @PathVariable String id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Receipt receipt = billingService.getReceipt(company, id);
        return new ResponseEntity<>(receipt, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PostMapping(CARDS)
    public ResponseEntity<Void> addCard(@PathVariable String companyId, @RequestBody StripeToken stripeToken) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();
        paymentService.addCard(company, stripeToken.getId());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @GetMapping(CARDS)
    public ResponseEntity<List<PaymentCard>> getCards(@PathVariable String companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        List<PaymentCard> cards = paymentService.getCards(company);
        return new ResponseEntity<>(cards, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PostMapping(CARDS + "/default")
    public ResponseEntity<Void> setDefaultCard(@PathVariable String companyId, @RequestBody String cardId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        paymentService.setDefaultCard(company, cardId);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @DeleteMapping(CARDS + ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteCard(@PathVariable String companyId, @PathVariable String id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(ValidationException::new);
        paymentService.deleteCard(company, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @GetMapping(LEADS + "/report")
    public ResponseEntity<CompanyLeadsReport> getCompanyLeadsReport(@PathVariable String companyId) {
        CompanyLeadsReport companyLeadsReport = billingService.getCompanyLeadsReport(companyId);
        return new ResponseEntity<>(companyLeadsReport, HttpStatus.OK);
    }

}
