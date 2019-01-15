package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.entity.User;
import com.improver.exception.ConflictException;
import com.improver.exception.ValidationException;
import com.improver.model.in.registration.ContractorRegistration;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.repository.UserRepository;
import com.improver.security.annotation.AdminAccess;
import com.improver.service.BillingService;
import com.improver.service.CompanyService;
import com.improver.service.UserService;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import javax.validation.Valid;
import java.util.UUID;

import static com.improver.application.properties.Path.CONTRACTORS;
import static com.improver.application.properties.Path.CUSTOMERS;
import static com.improver.application.properties.Path.REGISTRATION_PATH;

@RestController
@RequestMapping(REGISTRATION_PATH)
public class RegistrationController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private CompanyService companyService;
    @Autowired private BillingService billingService;


    @PostMapping("/change") //TODO: Fix the URL
    public ResponseEntity changeRegistrationEmail(@RequestBody OldNewValue oldNewEmail) {
        oldNewEmail.setNewValue(oldNewEmail.getNewValue().toLowerCase());
        oldNewEmail.setOldValue(oldNewEmail.getOldValue().toLowerCase());

        if(oldNewEmail.getOldValue().equals(oldNewEmail.getNewValue())) {
            throw new ValidationException("Email must be different");
        }

        User user = userRepository.findByEmail(oldNewEmail.getOldValue())
            .orElseThrow(() -> new ConflictException("Account doesn't exist for " + oldNewEmail.getNewValue()));
        if (user.isActivated()) {
            log.warn("Cannot change registration email. User {} already activated!", user.getEmail());
            throw new ValidationException("Cannot change registration email. Email already confirmed!");
        }

        // regenerate validation key, so the old confirmation links became invalid
        User updated = userRepository.save(user.setValidationKey(UUID.randomUUID().toString())
            .setEmail(oldNewEmail.getNewValue())
        );
        mailService.sendRegistrationConfirmEmail(updated);
        return new ResponseEntity(HttpStatus.OK);
    }


    @PostMapping("/resend")
    public ResponseEntity resendConfirmationMail(@RequestBody String email) {
        User user = userService.getByEmail(email.toLowerCase());
        if(user.isActivated() || user.getValidationKey() == null) {
            throw new ConflictException("Cannot resend confirmation mail. Email already confirmed!");
        }

        mailService.sendRegistrationConfirmEmail(user);

        return new ResponseEntity(HttpStatus.OK);
    }



    @PostMapping(CUSTOMERS)
    public ResponseEntity registerCustomer(@RequestBody UserRegistration customer) {
        log.info("Registration of customer = " + customer.getEmail());
        userService.registerCustomer(customer);
        return new ResponseEntity(HttpStatus.OK);
    }

    @PostMapping(CONTRACTORS)
    public ResponseEntity registerContractor(@RequestBody @Valid ContractorRegistration registration) {
        log.info("Registration of PRO = " + registration.getContractor().getEmail());

        // 1. Company
        Company company = companyService.registerCompany(registration.getCompany());

        // 2. Contractor
        userService.registerContractor(registration.getContractor(), company);

        // 3. Trades and Services
        companyService.updateTradesServicesCollection(company, registration.getTradesAndServices());

        // 4. Coverage
        companyService.updateCoverage(company, registration.getCoverage().getCenter().lat,
            registration.getCoverage().getCenter().lng, registration.getCoverage().getRadius());

        // 5. Add initial bonus from Invitation
        billingService.addInitialBonus(company, registration.getContractor().getEmail());

        return new ResponseEntity(HttpStatus.OK);
    }

}
