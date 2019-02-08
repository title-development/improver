package com.improver.security;

import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationDetailsSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.util.matcher.*;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.improver.security.SecurityProperties.*;
import static com.improver.util.ErrorMessages.BAD_CREDENTIALS_MSG;
import static com.improver.util.ErrorMessages.SESSION_TIMED_OUT_MSG;

@Slf4j
public class JwtAuthenticationFilter extends GenericFilterBean {

    private AuthenticationDetailsSource<HttpServletRequest, ?> authenticationDetailsSource = new WebAuthenticationDetailsSource();
    private JwtUtil jwtUtil;
    private List<RequestMatcher> matchers = new ArrayList<>();
    private List<RequestMatcher> skipMatchers = new ArrayList<>();
    private RequestMatcher requestMatcher;


    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
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
            log.debug(request.getMethod() + " " + request.getRequestURI() + "?" + request.getQueryString());
            Authentication authentication;
            try {
                authentication = attemptAuthentication(request, response);
            } catch (CredentialsExpiredException e) {
                log.trace("Token has expired");
                unsuccessfulAuthentication(response, SESSION_TIMED_OUT_MSG);
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
            filterChain.doFilter(servletRequest, servletResponse);
        }
        else {
            filterChain.doFilter(servletRequest, servletResponse);
        }


    }


    protected Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException, IOException {
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
        response.sendError(401, msg);
    }
}
