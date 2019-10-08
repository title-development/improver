package com.improver.controller;

import com.improver.entity.Customer;
import com.improver.entity.User;
import com.improver.model.in.OldNewValue;
import com.improver.repository.CustomerRepository;
import com.improver.repository.UserRepository;
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

import static com.improver.application.properties.Path.*;

@Slf4j
@Controller
@RequestMapping(USERS_PATH)
public class AccountController {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private ImageService imageService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private AccountService accountService;


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

    @GetMapping(NOTIFICATIONS)
    public ResponseEntity<Customer.NotificationSettings> getNotificationSettings() {

        Customer existed = userSecurityService.currentCustomer();

        Customer.NotificationSettings settings = existed.getNotificationSettings();

        return new ResponseEntity<>(settings, HttpStatus.OK);
    }


    @PutMapping(NOTIFICATIONS)
    public ResponseEntity<Void> updateNotificationSettings(@RequestBody Customer.NotificationSettings settings) {

        Customer existed = userSecurityService.currentCustomer();
        customerRepository.save(existed.setNotificationSettings(settings));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping(EMAIL_PATH_VARIABLE + "/restorePasswordRequest")
    public ResponseEntity<Void> restorePasswordRequest(@PathVariable String email) {
        log.info("Sending restoring password link for " + email);
        userService.restorePasswordRequest(email);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
