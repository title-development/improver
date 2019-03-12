package com.improver.controller;


import com.improver.entity.Contractor;
import com.improver.entity.User;
import com.improver.exception.BadRequestException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.out.LoginModel;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.CompanyService;
import com.improver.service.UserService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.util.Optional;
import java.util.UUID;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(REGISTRATION_PATH)
public class RegistrationController {
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private MailService mailService;
    @Autowired private CompanyService companyService;
    @Autowired private UserSecurityService userSecurityService;


    @PreAuthorize("isAnonymous()")
    @PostMapping("/change") //TODO: Fix the URL
    public ResponseEntity changeRegistrationEmail(@RequestBody OldNewValue oldNewEmail) {
        oldNewEmail.setNewValue(oldNewEmail.getNewValue().toLowerCase());
        oldNewEmail.setOldValue(oldNewEmail.getOldValue().toLowerCase());

        if (oldNewEmail.getOldValue().equals(oldNewEmail.getNewValue())) {
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

    @PreAuthorize("isAnonymous() || hasRole('INCOMPLETE_PRO')")
    @PostMapping("/resend")
    public ResponseEntity resendConfirmationMail(@RequestParam(required = false) String email, @RequestParam(required = false) Long userId) {
        if((email == null || email.isEmpty()) && userId == null) {
            throw new BadRequestException("Bad request");
        }
        User user = userService.resendConfirmationEmail(email, userId);
        mailService.sendRegistrationConfirmEmail(user);
        return new ResponseEntity(HttpStatus.OK);
    }

    @PreAuthorize("isAnonymous()")
    @PostMapping(CUSTOMERS)
    public ResponseEntity registerCustomer(@RequestBody @Valid UserRegistration customer) {
        log.info("Registration of customer = {}", customer.getEmail());
        userService.registerCustomer(customer);
        return new ResponseEntity(HttpStatus.OK);
    }


    @PreAuthorize("isAnonymous()")
    @PostMapping(CONTRACTORS)
    public ResponseEntity<LoginModel> registerContractor(@RequestBody @Valid UserRegistration registration, HttpServletResponse res) {
        log.info("Registration of PRO = {}", registration.getEmail());
        Contractor contractor = userService.registerContractor(registration);
        LoginModel loginModel = userSecurityService.performUserLogin(contractor, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('INCOMPLETE_PRO')")
    @PostMapping(COMPANIES)
    public ResponseEntity<LoginModel> registerCompany(@RequestBody @Valid CompanyRegistration registration, HttpServletResponse res) {
        log.info("Registration of Company = {}", registration.getCompany().getName());
        Contractor contractor = userSecurityService.currentPro();
        companyService.registerCompany(registration, contractor);
        LoginModel loginModel = null;
        if (!contractor.isNativeUser()) {
            loginModel = userSecurityService.performUserLogin(contractor, res);
        } else {
            userSecurityService.performLogout(contractor,res);
        }
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

}
