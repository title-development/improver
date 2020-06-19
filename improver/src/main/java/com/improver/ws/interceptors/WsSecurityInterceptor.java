package com.improver.ws.interceptors;

import com.improver.security.JwtPrincipal;
import com.improver.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.*;
import org.springframework.security.authentication.CredentialsExpiredException;

/**
 * Used for WS security.
 * Checks if WebSocket connection request contain JWT token.
 * Populate JWT principal to Spring Security context through {@link SimpMessageHeaderAccessor#setUser}
 *
 */
@Slf4j
public class WsSecurityInterceptor implements ChannelInterceptor {

    @Autowired
    @Qualifier("clientOutboundChannel")
    private MessageChannel clientOutboundChannel;

    @Autowired private JwtUtil jwtUtil;

    private static final String INVALID_TOKEN_ERROR = "403 Valid token required";
    private static final String TOKEN_EXPIRED_ERROR = "401 Token expired";

    /**
     * Checks if WebSocket connection request contain JWT token in "authorization header".
     * Populate JWT principal to Spring Security context through {@link SimpMessageHeaderAccessor#setUser}.
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        final StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            log.trace("WS: Connection attempt");
            String authorization = accessor.getFirstNativeHeader("authorization");
            if(authorization == null || authorization.isEmpty()){
                log.error("WS: Authorization header is empty");
                sendError(accessor, INVALID_TOKEN_ERROR);
                return null;
            }
            String jwt = authorization.replace("Bearer ", "");
            JwtPrincipal principal = null;
            try {
                principal = jwtUtil.parseAccessToken(jwt);
            } catch (CredentialsExpiredException e){
                sendError(accessor, TOKEN_EXPIRED_ERROR);
                log.debug("WS: Token expired");
                return null;
            } catch (Exception e){
                sendError(accessor, INVALID_TOKEN_ERROR);
                log.debug("WS: Invalid token");
                return null;
            }
            log.debug("WS | Connected");
            accessor.setUser(principal);
        }
        return message;
    }


    /**
     * Send error message in headers.message instead of body
     *
     */
    private void sendError(StompHeaderAccessor accessor, String message){
        String sessionId = accessor.getSessionId();
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
        headerAccessor.setMessage(message);
        headerAccessor.setSessionId(sessionId);
        clientOutboundChannel.send(MessageBuilder.createMessage("".getBytes(), headerAccessor.getMessageHeaders()));
    }
}
