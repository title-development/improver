package com.improver.controller;

import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
import com.improver.entity.User;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.repository.ProjectMessageRepository;
import com.improver.repository.ProjectRequestRepository;
import com.improver.security.JwtPrincipal;
import com.improver.security.annotation.SameUserAccess;
import com.improver.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import java.time.ZonedDateTime;
import static com.improver.application.properties.Path.*;

@Slf4j
@Controller
public class WebSocketEndpoint {

    @Autowired private ChatService chatService;


    @SameUserAccess
    @SubscribeMapping(PATH_WS_USERS + ID_PATH_VARIABLE + NOTIFICATIONS)
    public void subscribeToNotifications(@DestinationVariable long id) {
        log.debug("User id={} subscribed for notifications", id);
    }


    @SubscribeMapping(WS_TOPIC + PROJECT_REQUESTS + ID_PATH_VARIABLE)
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
    @MessageMapping(WS_QUEUE + PROJECT_REQUESTS + ID_PATH_VARIABLE)
    @SendTo(WS_TOPIC + PROJECT_REQUESTS + ID_PATH_VARIABLE)
    public ProjectMessage broadcastMessage(@Payload ProjectMessage message, @DestinationVariable long id) {
        return chatService.handleMessage(message, id);
    }


}
