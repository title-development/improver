package com.improver.security;

import com.improver.entity.Staff;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.handler.GenericExceptionHandler;
import com.improver.exception.handler.RestError;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.GenericFilterBean;


import javax.security.sasl.AuthenticationException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.ZonedDateTime;

import static com.improver.security.SecurityProperties.*;
import static com.improver.util.ErrorMessages.*;
import static java.time.temporal.ChronoUnit.MILLIS;
import static javax.servlet.http.HttpServletResponse.SC_FORBIDDEN;
import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;


public class RefreshAccessTokenFilter extends GenericFilterBean {


    private UserSecurityService userSecurityService;
    private AntPathRequestMatcher antPathRequestMatcher;
    private JwtUtil jwtUtil;

    public RefreshAccessTokenFilter(String url, UserSecurityService userSecurityService, JwtUtil jwtUtil) {
        antPathRequestMatcher = new AntPathRequestMatcher(url);
        this.userSecurityService = userSecurityService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        if(antPathRequestMatcher.matches(request)){
            // 1. Check cookies
            logger.debug("Refresh access call");
            String refreshToken = TokenProvider.getRefreshTokenFromCookie(request);
            if (refreshToken == null){
                logger.debug("Refresh token is absent");
                sendError(response, SC_UNAUTHORIZED, "Authentication is required");
                return;
            }

            // 2. Check token expiration
            User user = userSecurityService.findByRefreshId(refreshToken);
            if (user == null || ZonedDateTime.now().isAfter(user.getLastLogin().plus(SecurityProperties.REFRESH_TOKEN_EXPIRATION, MILLIS))) {
                logger.debug("Refresh token expired or invalid");
                TokenProvider.eraseRefreshCookie(response);
                sendError(response, SC_UNAUTHORIZED, SESSION_TIMED_OUT_MSG);
                return;
            }

            // 3. Check user
            if (user.isDeleted()) {
                logger.error(user.getEmail() + " is deleted");
                sendError(response, SC_FORBIDDEN, ACCOUNT_DELETED_MSG);
                return;
            }
            if (user.isBlocked()) {
                logger.error(user.getEmail() + " is blocked");
                sendError(response, SC_FORBIDDEN, ACCOUNT_BLOCKED_MSG);
                return;
            }
            if (user instanceof Staff) {
                if (((Staff) user).isCredentialExpired()) {
                    logger.error(user.getEmail() + " credentials expired");
                    sendError(response, SC_FORBIDDEN, CREDENTIALS_EXPIRED_MSG);
                    return;
                }
            }

            String jwt = jwtUtil.generateAccessJWT(user.getEmail(), user.getRole().toString());
            response.addHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }

    private void sendError(HttpServletResponse response, int error, String msg) throws IOException {
        response.getWriter().write(SerializationUtil.toJson(new RestError(error, msg)));
        response.sendError(error, msg);
    }
}
