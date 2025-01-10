package com.improver.filter;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

import static com.improver.application.properties.SystemProperties.MDC_REQUEST_ID_KEY;
import static com.improver.application.properties.SystemProperties.MDC_USERNAME_KEY;

@Data
@EqualsAndHashCode(callSuper = false)
@Component
public class MDCFilter extends GenericFilterBean {

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        doFilterInternal(request, response, filterChain);
    }

    protected void doFilterInternal(final HttpServletRequest request, HttpServletResponse response, final FilterChain chain) throws java.io.IOException, ServletException {
        try {
            if (StringUtils.isEmpty(MDC.get(MDC_REQUEST_ID_KEY))) {
                String requestId = UUID.randomUUID().toString().toUpperCase().replace("-", "");
                MDC.put(MDC_REQUEST_ID_KEY, requestId);
            }
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_REQUEST_ID_KEY);
            MDC.remove(MDC_USERNAME_KEY);
        }
    }
}

