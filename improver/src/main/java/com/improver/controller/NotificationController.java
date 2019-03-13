package com.improver.controller;

import com.improver.entity.Notification;
import com.improver.entity.ProjectRequest;
import com.improver.entity.User;
import com.improver.repository.NotificationRepository;
import com.improver.repository.ProjectMessageRepository;
import com.improver.security.UserSecurityService;
import com.improver.util.annotation.PageableSwagger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.web.SortDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

import static com.improver.application.properties.Path.*;

/**
 * For test purposes only
 */
@Slf4j
@Controller
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private ProjectMessageRepository projectMessageRepository;


    @PageableSwagger
    @GetMapping(NOTIFICATIONS_PATH + "/unread/count")
    public ResponseEntity<Long> getUnread() {
        User user = userSecurityService.currentUser();
        long count = notificationRepository.countUnread(user);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    @PageableSwagger
    @GetMapping(NOTIFICATIONS_PATH)
    public ResponseEntity<Page<Notification>> getAllNotifications(@PageableDefault(page = 0, size = 10) @SortDefault.SortDefaults({
                                                                        @SortDefault(sort = "created", direction = Sort.Direction.DESC)}) Pageable pageable) {
        User user = userSecurityService.currentUser();
        Page<Notification> allByUser = notificationRepository.findAllByUser(user, pageable);
        return new ResponseEntity<>(allByUser, HttpStatus.OK);
    }

    @GetMapping(NOTIFICATIONS_PATH + "/messages/unread")
    public ResponseEntity<List<Notification>> getAllUnreadMessages() {
        User user = userSecurityService.currentUser();
        List<Notification> messages = new ArrayList<>();
        if(user.getRole() == User.Role.CUSTOMER) {
            messages = projectMessageRepository.getAllUnreadMessagesForCustomers(user.getId(),
                ProjectRequest.Status.getActiveForCustomer());
        } else if(user.getRole() == User.Role.CONTRACTOR) {
            messages = projectMessageRepository.getAllUnreadMessagesForContractors(user.getId(),
                ProjectRequest.Status.getActiveForCustomer());
        }
        return new ResponseEntity<>(messages, HttpStatus.OK);
    }

    @PutMapping(NOTIFICATIONS_PATH + "/read")
    public ResponseEntity<Void> markAsRead(@RequestParam List<Long> ids) {
        User user = userSecurityService.currentUser();
        notificationRepository.markAsRead(user, ids);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
