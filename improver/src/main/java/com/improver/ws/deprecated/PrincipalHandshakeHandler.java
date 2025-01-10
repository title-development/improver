package com.improver.ws.deprecated;

import com.improver.exception.AccessDeniedException;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.security.JwtPrincipal;
import com.improver.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;


/**
 * Extracts principal from HTTP parameter on Handshake call
 */
@Deprecated
public class PrincipalHandshakeHandler extends DefaultHandshakeHandler {

    private JwtUtil jwtUtil;

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        ServletServerHttpRequest httpRequest = (ServletServerHttpRequest) request;
        HttpServletRequest req = httpRequest.getServletRequest();
        String tokenString = req.getParameter("access_token");
        if (tokenString == null){
            throw new AccessDeniedException();
        }
        String jwt = tokenString.replace("Bearer ", "");
        JwtPrincipal principal = null;
        try {
            principal = jwtUtil.parseAccessToken(jwt + "asd");
        } catch (CredentialsExpiredException e){
            throw new AuthenticationRequiredException();
        } catch (Exception e){
            principal = null;
            throw e;
        }
        return principal;
    }
}
