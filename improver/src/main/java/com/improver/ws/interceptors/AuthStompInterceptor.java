package com.improver.ws.interceptors;

import com.improver.security.JwtPrincipal;
import com.improver.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.*;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.web.socket.CloseStatus;

/**
 * Used for WS security.
 * Checks if WebSocket connection request contain JWT token.
 * Populate JWT principal to Spring Security context through {@link SimpMessageHeaderAccessor#setUser}
 *
 */
@Slf4j
public class AuthStompInterceptor implements ChannelInterceptor {

    @Autowired
    @Qualifier("clientOutboundChannel")
    private MessageChannel clientOutboundChannel;

    @Autowired private JwtUtil jwtUtil;

    /**
     * Checks if WebSocket connection request contain JWT token in "authorization header".
     * Populate JWT principal to Spring Security context through {@link SimpMessageHeaderAccessor#setUser}.
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        final StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.debug("Connection attempt to ws endpoint ");
            String authorization = accessor.getFirstNativeHeader("authorization");
            if(authorization == null || authorization.isEmpty()){
                sendError(accessor, "Valid token required");
                return null;
            }
            String jwt = authorization.replace("Bearer ", "");
            JwtPrincipal principal = null;
            try {
                principal = jwtUtil.parseAccessToken(jwt);
            } catch (CredentialsExpiredException e){
                sendError(accessor, "Expired");
                return null;
            } catch (Exception e){
                sendError(accessor, "Valid token required");
                return null;
            }

            accessor.setUser(principal);
        }
        return message;
    }


    private void sendError(StompHeaderAccessor accessor, String message){
        String sessionId = accessor.getSessionId();
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
        //headerAccessor.setMessage(message);
        headerAccessor.setSessionId(sessionId);
        clientOutboundChannel.send(MessageBuilder.createMessage(message.getBytes(), headerAccessor.getMessageHeaders()));
    }
}
