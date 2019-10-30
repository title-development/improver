package com.improver.controller;

import com.improver.entity.User;
import com.improver.exception.ConflictException;
import com.improver.model.in.UserActivation;
import com.improver.model.out.LoginModel;
import com.improver.repository.UserRepository;
import com.improver.security.JwtUtil;
import com.improver.security.UserSecurityService;
import com.improver.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(CONFIRM_PATH)
public class ConfirmationController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private JwtUtil jwtUtil;


    @PostMapping(ACTIVATION)
    public ResponseEntity<LoginModel> activateUser(@RequestBody @Valid UserActivation userActivation, HttpServletResponse res) {
        User user = userService.activateUser(userActivation);
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    @PostMapping(EMAIL)
    public ResponseEntity<LoginModel> confirmUserEmail(@RequestBody UserActivation userActivation, HttpServletResponse res) {
        String validationKey = jwtUtil.parseActivationJWT(userActivation.getToken(), null);
        userActivation.setToken(validationKey);
        User user = userService.confirmUserEmail(userActivation);

        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    //TODO: Andriy check this
    @PostMapping("/passwordReset")
    public ResponseEntity<LoginModel> restorePassword(@RequestBody UserActivation userActivation, HttpServletResponse res) {
        String validationKey = jwtUtil.parseActivationJWT(userActivation.getToken(), null);
        userActivation.setToken(validationKey);
        User user = userService.restorePassword(userActivation);

        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        return new ResponseEntity<>(loginModel, HttpStatus.OK);
    }

    //TODO: change to /validate
    @GetMapping("/check")
    public ResponseEntity<Void> checkConfirmLink(@RequestParam String token) {
        String validationKey = jwtUtil.parseActivationJWT(token, null);
        User user = userRepository.findByValidationKey(validationKey)
            .orElseThrow(() -> new ConflictException("Confirmation link is invalid"));
        if (user.isBlocked() || user.isDeleted()){
            throw new ConflictException("User is no longer active");
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }



}
