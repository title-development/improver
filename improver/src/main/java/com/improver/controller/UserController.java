package com.improver.controller;


import com.improver.entity.Admin;
import com.improver.entity.User;
import com.improver.exception.NotFoundException;
import com.improver.model.UserAccount;
import com.improver.model.admin.AdminContractor;
import com.improver.model.in.EmailPasswordTuple;
import com.improver.repository.ContractorRepository;
import com.improver.repository.CustomerRepository;
import com.improver.repository.UserRepository;
import com.improver.security.annotation.*;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.service.AccountService;
import com.improver.service.UserService;
import com.improver.util.annotation.PageableSwagger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

import java.util.List;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(USERS_PATH)
public class UserController {

    @Autowired private AccountService accountService;
    @Autowired private UserService userService;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ContractorRepository contractorRepository;


    @SameUserOrAdminAccess
    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<UserAccount> getUserAccount(@PathVariable("id") long id) {
        UserAccount userAccount = userRepository.getAccount(id);
        return new ResponseEntity<>(userAccount, HttpStatus.OK);
    }


    @SupportAccess
    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<User>> getUsers(@RequestParam(required = false) Long id,
                                               @RequestParam(required = false) String email,
                                               @RequestParam(required = false) String displayName,
                                               @RequestParam(required = false) User.Role role,
                                               @PageableDefault(sort = "email", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<User> users = userRepository.findBy(id, email, displayName, role, pageRequest);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }


    @SupportAccess
    @GetMapping("/staff")
    @PageableSwagger
    public ResponseEntity<Page<User>> getStaff(@PageableDefault(sort = "displayName", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<User> users = userRepository.findByRoleIn(List.of(User.Role.SUPPORT, User.Role.ADMIN), pageRequest);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE + "/delete")
    public ResponseEntity<Void> deleteAccount(@PathVariable long id) {

        User user = userRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        accountService.archiveAccount(user, userSecurityService.currentAdmin());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @SupportAccess
    @PutMapping(ID_PATH_VARIABLE + "/block")
    public ResponseEntity<Void> blockAccount(@PathVariable long id, @RequestParam boolean blocked) {
        Admin admin = userSecurityService.currentAdmin();
        userService.changeUserBlockedStatus(id, blocked, admin);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE + "/restore")
    public ResponseEntity<Void> restoreAccount(@PathVariable long id) {
        customerRepository.findById(id).ifPresent(customer -> userService.restoreCustomer(customer));
        contractorRepository.findById(id).ifPresent(contractor -> userService.restoreContractor(contractor));
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> updateUser(@PathVariable long id, @RequestBody User user) {
        userService.updateUser(id, user, userSecurityService.currentAdminOrNull());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @SameUserAccess
    @PutMapping(ID_PATH_VARIABLE + "/update")
    public ResponseEntity<Void> updateUserAccount(@PathVariable long id,
                                                  @RequestBody @Valid UserAccount user) {
        userService.updateAccount(id, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }



    @GetMapping(IS_EMAIL_FREE)
    public ResponseEntity<Void> isEmailFree(@RequestParam("email") String email) {
        return new ResponseEntity<>(userService.isEmailFree(email) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }


    //TODO: Andriy move check password inside service method
    @SameUserAccess
    @PutMapping(ID_PATH_VARIABLE + EMAIL)
    public ResponseEntity<Void> updateEmail(@PathVariable long id, @RequestBody EmailPasswordTuple emailPasswordTuple) {
        log.info("update Email for " + emailPasswordTuple.getEmail());
        User user = userSecurityService.currentUser();
        if (user.isNativeUser()) {
            userService.checkPassword(emailPasswordTuple.getPassword());
        }
        userService.updateEmail(id, emailPasswordTuple.getEmail());
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping(CONTRACTORS)
    @PageableSwagger
    public ResponseEntity<Page<AdminContractor>> getAllContractors(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String displayName,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String companyName,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminContractor> contractor = this.userService.getAllContractors(id, displayName, email, companyName, pageRequest);
        return new ResponseEntity<>(contractor, HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE + CONTRACTORS)
    public ResponseEntity<Void> updateContractor(@PathVariable long id, @RequestBody AdminContractor adminContractor) {
        userService.updateAdminUser(id, adminContractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping(CUSTOMERS)
    @PageableSwagger
    public ResponseEntity<Page<User>> getAllCustomers(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String displayName,
        @RequestParam(required = false) String email,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<User> customers = this.userService.getAllCustomers(id, displayName, email, pageRequest);
        return new ResponseEntity<>(customers, HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(ID_PATH_VARIABLE + CUSTOMERS)
    public ResponseEntity<Void> updateCustomer(@PathVariable long id, @RequestBody AdminContractor adminContractor) {
        userService.updateAdminUser(id, adminContractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @AdminAccess
    @PostMapping(ID_PATH_VARIABLE + "/password-expire")
    public ResponseEntity<Void> passwordExpire(@PathVariable long id) {
        userService.expireCredentials(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
