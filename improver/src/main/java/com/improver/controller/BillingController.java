package com.improver.controller;

import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.model.out.billing.PaymentCard;
import com.improver.model.out.billing.Receipt;
import com.improver.model.out.billing.TransactionModel;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.service.*;
import com.improver.model.in.StripeToken;
import com.improver.repository.BillRepository;
import com.improver.repository.CompanyRepository;
import com.improver.util.PaymentCardsHandler;
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

import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID)
public class BillingController {

    @Autowired private BillingService billingService;
    @Autowired private PaymentService paymentService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private CompanyService companyService;
    @Autowired private UserSecurityService userSecurityService;
    private final PaymentCardsHandler paymentCardsHandler = new PaymentCardsHandler();



    @CompanyMemberOrSupportAccess
    @GetMapping("/balance")
    public ResponseEntity<Integer> getBalance(@PathVariable long companyId) {
        Billing billing = billRepository.findByCompanyId(companyId)
            .orElseThrow(NotFoundException::new);
        return new ResponseEntity<>(billing.getBalance(), HttpStatus.OK);
    }


    @AdminAccess
    @PostMapping("/bonus")
    public ResponseEntity<Void> addBonus(@PathVariable long companyId, @RequestBody int amount) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        billingService.addBonus(company, amount, null, userSecurityService.currentStaff());
        return new ResponseEntity<>(HttpStatus.OK);
    }



    @CompanyMemberOrSupportAccess
    @PageableSwagger
    @GetMapping(TRANSACTIONS)
    public ResponseEntity<Page<TransactionModel>> getCompanyTransactions(@PathVariable long companyId,
                                                                         @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Page<TransactionModel> transactionsPage = companyService.getTransactions(companyId, pageRequest, true);
        return new ResponseEntity<>(transactionsPage, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PageableSwagger
    @GetMapping(TRANSACTIONS + ID_PATH_VARIABLE)
    public ResponseEntity<Receipt> getReceipt(@PathVariable long companyId, @PathVariable String id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Receipt receipt = billingService.getReceipt(company, id);
        return new ResponseEntity<>(receipt, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PostMapping(CARDS)
    public ResponseEntity<Void> addCard(@PathVariable long companyId, @RequestBody StripeToken stripeToken) {
        Contractor contractor = userSecurityService.currentPro();
        paymentService.addCard(contractor, stripeToken.getId());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @GetMapping(CARDS)
    public ResponseEntity<List<PaymentCard>> getCards(@PathVariable long companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        List<PaymentCard> cards = paymentCardsHandler.getCards(company);
        return new ResponseEntity<>(cards, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PostMapping(CARDS + "/default")
    public ResponseEntity<Void> setDefaultCard(@PathVariable long companyId, @RequestBody String cardId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        paymentService.setDefaultCard(company, cardId);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @DeleteMapping(CARDS + ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteCard(@PathVariable long companyId, @PathVariable String id) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        paymentService.deleteCard(company, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
