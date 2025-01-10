package com.improver.controller;

import com.improver.entity.User;
import com.improver.model.UserAccount;
import com.improver.model.in.EmailPasswordTuple;
import com.improver.model.in.OldNewValue;
import com.improver.security.UserSecurityService;
import com.improver.service.AccountService;
import com.improver.service.ImageService;
import com.improver.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import static com.improver.application.properties.Path.*;

@Slf4j
@Controller
@RequestMapping(ACCOUNT_PATH)
public class AccountController {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private ImageService imageService;
    @Autowired private AccountService accountService;



    @GetMapping
    public ResponseEntity<UserAccount> getUserAccount() {
        User user = userSecurityService.currentUser();
        return new ResponseEntity<>(new UserAccount(user), HttpStatus.OK);
    }

    @PutMapping("/update")
    public ResponseEntity<Void> updateUserAccount(@RequestBody @Valid UserAccount user) {
        User current = userSecurityService.currentUser();
        accountService.updateAccount(current, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PutMapping(EMAIL)
    public ResponseEntity<Void> updateEmail(@RequestBody EmailPasswordTuple emailPasswordTuple) {
        User user = userSecurityService.currentUser();
        accountService.updateEmail(user, emailPasswordTuple);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping(PHONE)
    public ResponseEntity<Void> updatePhoneNumber(@RequestBody String phoneNumber) {
        User user = userSecurityService.currentUser();
        accountService.updatePhoneNumber(user, phoneNumber);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PutMapping(PASSWORD)
    public ResponseEntity<Void> updatePassword(@RequestBody OldNewValue oldNewValue) {
        User user = userSecurityService.currentUser();
        userService.updaterPassword(oldNewValue, user);
        log.info("update Password for userId: " + user.getId());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PutMapping("/delete")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody(required = false) String password) {
        accountService.archiveAccountWithPassword(userSecurityService.currentUser(), password);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Accepts image as BASE64 encoded data like "data:image/jpeg;base64,/9j/4AAQ...yD=="
     */
    @PostMapping("/base64icon")
    public ResponseEntity<String> updateIconInBase64(@RequestBody String imageInBase64) {
        User user = userSecurityService.currentUser();
        String imageUrl = imageService.saveBase64Image(imageInBase64);
        userService.updateIcon(user, imageUrl);
        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @DeleteMapping(ICON)
    public ResponseEntity<Void> deleteIcon() {
        User user = userSecurityService.currentUser();
        userService.deleteIcon(user);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PostMapping(EMAIL_PATH_VARIABLE + "/reset-password-request")
    public ResponseEntity<Void> resetPasswordRequest(@PathVariable String email) {
        log.info("Sending restoring password link for " + email);
        accountService.resetPasswordRequest(email);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
