package com.improver.controller;

import com.improver.entity.Customer;
import com.improver.entity.User;
import com.improver.repository.CustomerRepository;
import com.improver.repository.ProjectRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.SearchService;
import com.improver.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Size;
import java.util.List;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.Path.NOTIFICATIONS;
import static com.improver.util.database.DataRestrictions.USER_SEARCH_MAX_SIZE;

@Slf4j
@Controller
@RequestMapping(CUSTOMERS_PATH)
public class CustomerController {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private SearchService searchService;



    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/last-zip")
    public ResponseEntity<String> loadLastUsersProjectZipCode(){
        Customer customer = userSecurityService.currentCustomer();
        String zipCode = projectRepository.findLastZipCodeByCustomerId(customer.getId());
        return new ResponseEntity<>(zipCode, HttpStatus.OK);
    }

    @PostMapping(SEARCHES)
    public ResponseEntity<Void> saveCustomerSearch(@RequestParam String zipCode,
                                                   @RequestParam @Size(max = USER_SEARCH_MAX_SIZE) String search,
                                                   @RequestParam String isManual){
        User user = userSecurityService.currentUserOrNull();
        userService.saveUserSearches(user, search, zipCode, Boolean.parseBoolean(isManual));
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(SEARCHES)
    public ResponseEntity<List<String>> getRecentSearches(@RequestParam(defaultValue = "5") int size){
        Customer customer = userSecurityService.currentCustomer();
        List<String> recentSearches = searchService.getTopSearchesByCustomerId(customer.getId(), size);
        return new ResponseEntity<>(recentSearches, HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(NOTIFICATIONS)
    public ResponseEntity<Customer.NotificationSettings> getNotificationSettings() {
        Customer existed = userSecurityService.currentCustomer();
        Customer.NotificationSettings settings = existed.getNotificationSettings();
        return new ResponseEntity<>(settings, HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @PutMapping(NOTIFICATIONS)
    public ResponseEntity<Void> updateNotificationSettings(@RequestBody Customer.NotificationSettings settings) {
        Customer existed = userSecurityService.currentCustomer();
        customerRepository.save(existed.setNotificationSettings(settings));
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
