package com.improver.controller;

import com.improver.entity.StaffAction;
import com.improver.entity.User;
import com.improver.model.in.registration.StaffRegistration;
import com.improver.model.out.StaffActionModel;
import com.improver.repository.StaffActionRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.StaffAccess;
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

import java.time.ZonedDateTime;

import static com.improver.application.properties.Path.ACTIONS;
import static com.improver.application.properties.Path.STAFF_PATH;


@Slf4j
@RestController
@RequestMapping(STAFF_PATH)
public class StaffController {

    @Autowired private UserService userService;
    @Autowired private StaffActionRepository staffActionRepository;
    @Autowired private UserSecurityService userSecurityService;

    @AdminAccess
    @PostMapping()
    public ResponseEntity<Void> createUser(@RequestBody StaffRegistration staffRegistration) {
        userService.createStaffUser(staffRegistration, userSecurityService.currentAdmin());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @StaffAccess
    @PageableSwagger
    @GetMapping(ACTIONS)
    public ResponseEntity<Page<StaffActionModel>> getActions(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String author,
        @RequestParam(required = false) User.Role authorRole,
        @RequestParam(required = false) StaffAction.Action action,
        @RequestParam(required = false) ZonedDateTime createdFrom,
        @RequestParam(required = false) ZonedDateTime createdTo,
        @PageableDefault(sort = "id", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<StaffActionModel> actions = this.staffActionRepository.getAllBy(id, author, authorRole, action, createdFrom, createdTo, pageRequest);
        return new ResponseEntity<>(actions, HttpStatus.OK);
    }

}
