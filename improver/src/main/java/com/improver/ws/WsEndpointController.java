package com.improver.ws;

import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
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

/*    @MessageExceptionHandler
    @SendToUser(value="/queue/errors")
    public String handleException(Throwable exception) {
        return exception.getMessage();
    }*/


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
