package com.improver.controller;

import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
import com.improver.exception.AccessDeniedException;
import com.improver.model.out.NotificationMessage;
import com.improver.security.JwtPrincipal;
import com.improver.security.SecurityHelper;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.SameUserAccess;
import com.improver.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;

import static com.improver.application.properties.Path.*;

@Slf4j
@Controller
public class WsEndpointController {

    @Autowired private ChatService chatService;
    @Autowired private SecurityHelper securityHelper;
    @Autowired private UserSecurityService userSecurityService;


    @SubscribeMapping(WS_QUEUE_USERS + ID_PATH_VARIABLE + NOTIFICATIONS)
    public void subscribeToNotifications(@DestinationVariable long id) {
        if (userSecurityService.currentUser().getId() != id) {
            throw new AccessDeniedException();
        }
        log.debug("User id={} subscribed for notifications", id);
    }

    @MessageMapping({WS_APP_USERS + ID_PATH_VARIABLE + UNREAD})
    @SendTo(WS_QUEUE_USERS + ID_PATH_VARIABLE + NOTIFICATIONS)
    public NotificationMessage getAllUnreadMessages(@DestinationVariable long id) {
        JwtPrincipal jwtPrincipal = securityHelper.currentPrincipal();
        return NotificationMessage.unread(chatService.getAllUnreadMessages(id, jwtPrincipal.getRole()));
    }

    @SubscribeMapping(WS_TOPIC_PROJECT_REQUESTS + ID_PATH_VARIABLE)
    public void subscribeToChat(@DestinationVariable long id){
        // simply perform security check
        chatService.getWithSecurityCheck(id, true);

    }

    /**
     *  Accept and send message for given {@link ProjectRequest} chat.
     *  The message will be sent to the same destination as the incoming message
     *  but with an additional prefix ("/topic" by default).
     *
     */
    @MessageMapping(WS_APP_PROJECT_REQUESTS + ID_PATH_VARIABLE)
    @SendTo(WS_TOPIC_PROJECT_REQUESTS + ID_PATH_VARIABLE)
    public ProjectMessage broadcastMessage(@Payload ProjectMessage message, @DestinationVariable long id) {
        return chatService.handleMessage(message, id);
    }


}
