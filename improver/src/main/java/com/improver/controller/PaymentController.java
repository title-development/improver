package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.*;

@Deprecated
@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID)
public class PaymentController {

    @Autowired private PaymentService paymentService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private CompanyRepository companyRepository;

    @PostMapping(PAYMENTS)
    public ResponseEntity<Void> charge(@PathVariable long companyId, @RequestBody int amount) {
        Contractor contractor = userSecurityService.currentPro();
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        paymentService.replenishBalance(company, contractor, amount);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
