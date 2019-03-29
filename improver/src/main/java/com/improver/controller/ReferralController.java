package com.improver.controller;

import com.improver.entity.Contractor;
import com.improver.security.UserSecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.REFERRAL_PATH;

@RestController
@RequestMapping(REFERRAL_PATH)
public class ReferralController {

    @Autowired UserSecurityService userSecurityService;

    @GetMapping
    @PreAuthorize("hasRole('CONTRACTOR')")
    public ResponseEntity<String> getReferralCode() {
        Contractor contractor = userSecurityService.currentPro();

        return new ResponseEntity<>(contractor.getRefCode(), HttpStatus.OK);
    }

}
