package com.improver.security;

import com.improver.application.properties.SecurityProperties;
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

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static com.improver.security.JwtUtil.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.JwtUtil.BEARER_TOKEN_PREFIX;
import static com.improver.util.ErrorMessages.BAD_CREDENTIALS_MSG;

@Slf4j
public class JwtAuthenticationFilter extends GenericFilterBean {
    private static final String MDC_USERNAME_KEY = "username";

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


    public void doAuthentication(HttpServletRequest request, HttpServletResponse response) throws IOException, ServletException {
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
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        if (requestMatcher.matches(request)) {
            log.debug(request.getMethod() + " " + request.getRequestURI() + Optional.ofNullable(request.getQueryString()).map(q -> "?" + q).orElse(""));
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
                String name = Optional.ofNullable(authentication).map(Principal::getName).orElse("anonymous");
                MDC.put(MDC_USERNAME_KEY, name);

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
            return null;
        }
        JwtPrincipal principal = jwtUtil.parseAccessToken(jwt);
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
