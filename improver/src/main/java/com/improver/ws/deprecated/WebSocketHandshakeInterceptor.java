package com.improver.ws.deprecated;

import com.improver.security.JwtPrincipal;
import com.improver.security.JwtUtil;
import org.slf4j.LoggerFactory;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.AbstractHandshakeHandler;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Customize WebSocket/STOMP handshake
 *
 */
@Deprecated
public class WebSocketHandshakeInterceptor implements HandshakeInterceptor {

    private final org.slf4j.Logger log = LoggerFactory.getLogger(getClass());

    private JwtUtil jwtUtil;



    /**
     * Obtain JWT from request param "access_token" within the HTTP request
     * so the {@link AbstractHandshakeHandler#determineUser} method will retrieve it and populate into security Context
     */
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        log.debug("WS Handshake | request=" + request.getURI());

        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest httpRequest = (ServletServerHttpRequest) request;
            HttpServletRequest req = httpRequest.getServletRequest();
            String tokenString = req.getParameter("access_token");
            if (tokenString == null){
                return false;
            }
            String jwt = tokenString.replace("Bearer ", "");
            try {
                JwtPrincipal jwtPrincipal = jwtUtil.parseAccessToken(jwt);
            } catch (Exception e){
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {

    }
}
