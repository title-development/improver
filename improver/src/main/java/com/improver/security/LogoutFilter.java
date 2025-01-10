package com.improver.security;

import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.filter.GenericFilterBean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class LogoutFilter extends GenericFilterBean {

    private AntPathRequestMatcher antPathRequestMatcher;
    private UserSecurityService userSecurityService;

    public LogoutFilter(String url, UserSecurityService userSecurityService) {
        antPathRequestMatcher = new AntPathRequestMatcher(url);
        this.userSecurityService = userSecurityService;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        if(antPathRequestMatcher.matches(request)){
            logger.debug("Performing logout");
            userSecurityService.eraseRefreshCookie(response);
            return;
        }

        filterChain.doFilter(servletRequest, servletResponse);
    }
}
