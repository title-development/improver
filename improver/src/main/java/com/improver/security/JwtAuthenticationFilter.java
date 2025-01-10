package com.improver.security;

import com.improver.application.properties.SecurityProperties;
import com.improver.application.properties.SystemProperties;
import com.improver.exception.handler.RestError;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.AuthenticationDetailsSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.util.matcher.AndRequestMatcher;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.GenericFilterBean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.improver.application.properties.SystemProperties.MDC_USERNAME_KEY;
import static com.improver.security.JwtUtil.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.JwtUtil.BEARER_TOKEN_PREFIX;
import static com.improver.util.ErrorMessages.BAD_CREDENTIALS_MSG;

@Slf4j
public class JwtAuthenticationFilter extends GenericFilterBean {
    private AuthenticationDetailsSource<HttpServletRequest, ?> authenticationDetailsSource = new WebAuthenticationDetailsSource();
    private JwtUtil jwtUtil;
    private SecurityProperties securityProperties;
    private List<RequestMatcher> matchers = new ArrayList<>();
    private List<RequestMatcher> skipMatchers = new ArrayList<>();
    private RequestMatcher requestMatcher;


    public JwtAuthenticationFilter(JwtUtil jwtUtil, SecurityProperties securityProperties) {
        this.jwtUtil = jwtUtil;
        this.securityProperties = securityProperties;
    }

    public JwtAuthenticationFilter addMatcher(RequestMatcher matcher) {
        this.matchers.add(matcher);
        return this;
    }

    public JwtAuthenticationFilter skipMatcher(RequestMatcher matcher) {
        skipMatchers.add(new NegatedRequestMatcher(matcher));
        return this;
    }

    public JwtAuthenticationFilter build(){
        List<RequestMatcher> all = new ArrayList<>();
        all.add(new OrRequestMatcher(this.matchers));
        all.addAll(this.skipMatchers);
        this.requestMatcher = new AndRequestMatcher(all);
        return this;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        if (requestMatcher.matches(request)) {
            try {
                Authentication authentication;
                try {
                    authentication = attemptAuthentication(request, response);
                } catch (CredentialsExpiredException e) {
                    log.trace("Token has expired");
                    unsuccessfulAuthentication(response, "Token has expired");
                    return;
                } catch (BadCredentialsException e) {
                    log.trace("Invalid Token", e);
                    unsuccessfulAuthentication(response, BAD_CREDENTIALS_MSG);
                    return;
                }  catch (Exception e) {
                    log.error("Generic error during authorization", e);
                    unsuccessfulAuthentication(response, BAD_CREDENTIALS_MSG);
                    return;
                }
                SecurityContextHolder.getContext().setAuthentication(authentication);


                filterChain.doFilter(request, response);
            } finally {
                MDC.remove(MDC_USERNAME_KEY);
            }

        } else {
            filterChain.doFilter(request, response);
        }
    }


    protected Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        String jwt = getAccessToken(request);
        if (jwt == null) {
            MDC.put(MDC_USERNAME_KEY, "anonymous");
            return null;
        }
        JwtPrincipal principal = jwtUtil.parseAccessToken(jwt);
        MDC.put(MDC_USERNAME_KEY, principal.getName());
        principal.setDetails(authenticationDetailsSource.buildDetails(request));
        return principal;
    }



    protected String getAccessToken(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER_NAME);
        if (authHeader != null && authHeader.startsWith(BEARER_TOKEN_PREFIX)) {
            return authHeader.substring(BEARER_TOKEN_PREFIX.length());
        }
        return null;
    }


    protected void unsuccessfulAuthentication(HttpServletResponse response, String msg) throws IOException {
        SecurityContextHolder.clearContext();
        sendError(response, 401, msg);
    }

    private void sendError(HttpServletResponse response, int error, String msg) throws IOException {
        response.setHeader("Access-Control-Allow-Origin", securityProperties.getOrigin());
        response.getWriter().write(SerializationUtil.toJson(new RestError(error, msg)));
        response.sendError(error, msg);
    }
}
