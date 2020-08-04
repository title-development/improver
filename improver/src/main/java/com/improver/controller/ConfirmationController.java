package com.improver.controller;

import com.improver.entity.User;
import com.improver.exception.ConflictException;
import com.improver.model.out.LoginModel;
import com.improver.model.in.UserActivation;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.AccountService;
import com.improver.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(CONFIRM_PATH)
public class ConfirmationController {

    @Autowired private AccountService accountService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private JwtUtil jwtUtil;


    @PostMapping(ACTIVATION)
    public ResponseEntity<LoginModel> activateUser(@RequestBody @Valid UserActivation userActivation, HttpServletRequest req, HttpServletResponse res) {
        User user = accountService.activateUser(userActivation);
        LoginModel loginModel = userSecurityService.performUserLogin(user, req, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @PostMapping(EMAIL)
    public ResponseEntity<LoginModel> confirmEmailChange(@RequestBody UserActivation userActivation, HttpServletRequest req, HttpServletResponse res) {
        User user = accountService.confirmUserEmail(userActivation);
        LoginModel loginModel = userSecurityService.performUserLogin(user, req, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @PostMapping("/password-reset")
    public ResponseEntity<LoginModel> resetPassword(@RequestBody UserActivation userActivation, HttpServletRequest req, HttpServletResponse res) {
        User user = accountService.resetPassword(userActivation);
        LoginModel loginModel = userSecurityService.performUserLogin(user, req, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }


    @GetMapping("/verify")
    public ResponseEntity<Void> checkConfirmLink(@RequestParam String token) {
        String validationKey = jwtUtil.parseActivationJWT(token);
        User user = userRepository.findByValidationKey(validationKey)
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        if (user.isBlocked() || user.isDeleted()){
            throw new ConflictException("User is no longer active");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }



}
