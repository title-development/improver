package com.improver.controller;

import com.improver.entity.Customer;
import com.improver.entity.User;
import com.improver.exception.NotFoundException;
import com.improver.model.in.OldNewValue;
import com.improver.repository.CustomerRepository;
import com.improver.repository.UserRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.SameUserAccess;
import com.improver.service.AccountService;
import com.improver.service.ImageService;
import com.improver.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.improver.application.properties.Path.*;

@Slf4j
@Deprecated
//TODO: remove user ID
@Controller
@RequestMapping(USERS_PATH)
public class AccountController {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private ImageService imageService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private AccountService accountService;


    @SameUserAccess
    @PutMapping(ID_PATH_VARIABLE + PASSWORD)
    public ResponseEntity<Void> updatePassword(@PathVariable long id, @RequestBody OldNewValue oldNewValue) {
        log.info("update Password for ");
        User user = userSecurityService.currentUser();
        userService.updaterPassword(oldNewValue, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping("/delete")
    public ResponseEntity<Void> deleteMyAccount(@RequestBody(required = false) String password) {
        accountService.archiveAccountWithPassword(userSecurityService.currentUser(), password);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SameUserAccess
    @PostMapping(ID_PATH_VARIABLE + ICON)
    public ResponseEntity<String> updateIcon(@PathVariable long id, MultipartFile file) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = imageService.saveImage(file);
        userService.updateIcon(user, imageUrl);
        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    /**
     * Accepts image as BASE64 encoded data like "data:image/jpeg;base64,/9j/4AAQ...yD=="
     */
    @SameUserAccess
    @PostMapping(ID_PATH_VARIABLE + "/base64icon")
    public ResponseEntity<String> updateIconInBase64(@PathVariable long id, @RequestBody String imageInBase64) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = imageService.saveBase64Image(imageInBase64);
        userService.updateIcon(user, imageUrl);
        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @SameUserAccess
    @DeleteMapping(ID_PATH_VARIABLE + ICON)
    public ResponseEntity<Void> deleteIcon(@PathVariable long id) {
        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = user.getIconUrl();
        if (imageUrl == null || imageUrl.isEmpty()) {
            throw new NotFoundException();
        }
        imageService.silentDelete(imageUrl);

        userService.updateIcon(user, null);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SameUserAccess
    @GetMapping(ID_PATH_VARIABLE + NOTIFICATIONS)
    public ResponseEntity<Customer.NotificationSettings> getNotificationSettings(@PathVariable long id) {

        Customer existed = customerRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        Customer.NotificationSettings settings = existed.getNotificationSettings();

        return new ResponseEntity<>(settings, HttpStatus.OK);
    }


    @SameUserAccess
    @PutMapping(ID_PATH_VARIABLE + NOTIFICATIONS)
    public ResponseEntity<Void> updateNotificationSettings(@PathVariable long id, @RequestBody Customer.NotificationSettings settings) {

        Customer existed = customerRepository.findById(id)
            .orElseThrow(NotFoundException::new);
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
