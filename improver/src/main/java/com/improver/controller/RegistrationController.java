package com.improver.controller;


import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.BadRequestException;
import com.improver.model.in.OldNewValue;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.out.LoginModel;
import com.improver.model.recapcha.ReCaptchaResponse;
import com.improver.security.UserSecurityService;
import com.improver.service.ReCaptchaService;
import com.improver.service.RegistrationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import static com.improver.application.properties.Path.*;
import static com.improver.util.ErrorMessages.CAPTCHA_VALIDATION_ERROR_MESSAGE;

@Slf4j
@RestController
@RequestMapping(REGISTRATION_PATH)
public class RegistrationController {


    @Autowired private UserSecurityService userSecurityService;
    @Autowired private ReCaptchaService reCaptchaService;
    @Autowired private RegistrationService registrationService;


    @PreAuthorize("isAnonymous()")
    @PostMapping("/email-change")
    public ResponseEntity changeRegistrationEmail(@RequestBody OldNewValue oldNewEmail) {
        registrationService.changeRegistrationEmail(oldNewEmail);
        return new ResponseEntity(HttpStatus.OK);
    }

    @PreAuthorize("isAnonymous() || hasRole('CUSTOMER') || hasRole('INCOMPLETE_PRO')")
    @PostMapping("/resend")
    public ResponseEntity resendConfirmationMail(@RequestParam(required = false) String email, @RequestParam(required = false) Long userId) {
        if((email == null || email.isEmpty()) && userId == null) {
            throw new BadRequestException("Bad request");
        }
        registrationService.resendRegistrationConfirmationEmail(email, userId);
        return new ResponseEntity(HttpStatus.OK);
    }

    @PreAuthorize("isAnonymous()")
    @PostMapping(CUSTOMERS)
    public ResponseEntity<LoginModel> registerCustomer(@RequestBody @Valid UserRegistration customerRegistration, HttpServletRequest req, HttpServletResponse res) {
        log.info("Registration of customer = {}", customerRegistration.getEmail());
        ReCaptchaResponse reCaptchaResponse = reCaptchaService.validate(customerRegistration.getCaptcha(), req.getRemoteAddr());
        if(!reCaptchaResponse.isSuccess()) {
            throw new AuthenticationRequiredException(CAPTCHA_VALIDATION_ERROR_MESSAGE);
        }
        Customer registered = registrationService.registerCustomer(customerRegistration);
        LoginModel loginModel = userSecurityService.performUserLogin(registered, req, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @PreAuthorize("isAnonymous()")
    @PostMapping(CONTRACTORS)
    public ResponseEntity<LoginModel> registerContractor(@RequestBody @Valid UserRegistration registration, HttpServletResponse res, HttpServletRequest req) {
        log.info("Registration of PRO = {}", registration.getEmail());
        ReCaptchaResponse reCaptchaResponse = reCaptchaService.validate(registration.getCaptcha(), req.getRemoteAddr());
        if(!reCaptchaResponse.isSuccess()) {
            throw new AuthenticationRequiredException(CAPTCHA_VALIDATION_ERROR_MESSAGE);
        }
        Contractor contractor = registrationService.registerContractor(registration);
        LoginModel loginModel = userSecurityService.performUserLogin(contractor, req, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('INCOMPLETE_PRO')")
    @PostMapping(COMPANIES)
    public ResponseEntity<LoginModel> registerCompany(@RequestBody @Valid CompanyRegistration registration, HttpServletRequest req, HttpServletResponse res) {
        log.info("Registration of Company = {}", registration.getCompany().getName());
        Contractor contractor = userSecurityService.currentPro();
        registrationService.registerCompany(registration, contractor);
        LoginModel loginModel = null;
        if (!contractor.isNativeUser() && contractor.isActivated()) {
            loginModel = userSecurityService.performUserLogin(contractor, req, res);
        } else {
            userSecurityService.performLogout(contractor,res);
        }
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

}
