package com.improver.controller;

import com.improver.model.in.PhoneValidationConfirm;
import com.improver.service.PhoneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Deprecated
@RestController
@RequestMapping("api/phone")
public class PhoneController {

    @Autowired private PhoneService phoneService;

    @PostMapping("/validation/request")
    public ResponseEntity<String> sendValidationMessage(@RequestBody String phoneNumber) {
        return new ResponseEntity<>(phoneService.requestPhoneValidation(phoneNumber), HttpStatus.OK);
    }

    @PostMapping("/validation/confirm")
    public ResponseEntity<String> validationConfirm(@RequestBody PhoneValidationConfirm phoneValidationConfirm) {
        phoneService.confirmPhoneValidation(phoneValidationConfirm);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
