package com.improver.filter;


import lombok.Data;
import lombok.EqualsAndHashCode;
import org.slf4j.MDC;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Data
@EqualsAndHashCode(callSuper = false)
@Component
public class MDCFilter extends GenericFilterBean {

    private static final String MDC_REQUEST_ID_KEY = "requestId";

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        doFilterInternal(request, response, filterChain);
    }

    protected void doFilterInternal(final HttpServletRequest request, HttpServletResponse response, final FilterChain chain)
        throws java.io.IOException, ServletException {
        try {
            final String requestId;
            if (!StringUtils.isEmpty(MDC_REQUEST_ID_KEY) && !StringUtils.isEmpty(request.getHeader(MDC_REQUEST_ID_KEY))) {
                requestId = request.getHeader(MDC_REQUEST_ID_KEY);
            } else {
                requestId = UUID.randomUUID().toString().toUpperCase().replace("-", "");
            }
            MDC.put(MDC_REQUEST_ID_KEY, requestId);
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_REQUEST_ID_KEY);
        }
    }
}

