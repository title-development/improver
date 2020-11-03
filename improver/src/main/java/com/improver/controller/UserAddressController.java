package com.improver.controller;


import com.improver.model.UserAddressModel;
import com.improver.repository.UserAddressRepository;
import com.improver.security.UserSecurityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(API_PATH_PREFIX + USERS)
public class UserAddressController {

    @Autowired private UserAddressRepository userAddressRepository;
    @Autowired private UserSecurityService userSecurityService;

    @GetMapping(ADDRESS)
    public ResponseEntity<List<UserAddressModel>> getUserAddresses() {
        List<UserAddressModel> userAddresses = userAddressRepository.getAllByCustomerId(userSecurityService.currentCustomer().getId());

        return new ResponseEntity<>(userAddresses, HttpStatus.OK);
    }
}
