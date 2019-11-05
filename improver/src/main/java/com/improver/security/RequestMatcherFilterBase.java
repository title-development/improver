package com.improver.security;

import lombok.extern.slf4j.Slf4j;
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
import java.util.ArrayList;
import java.util.List;

@Deprecated
@Slf4j
public class RequestMatcherFilterBase extends GenericFilterBean {

    public static class Builder {
        private List<RequestMatcher> matchers = new ArrayList<>();
        private List<RequestMatcher> skipMatchers = new ArrayList<>();

        public Builder addMatcher(RequestMatcher matcher) {
            this.matchers.add(matcher);
            return this;
        }

        public Builder skipMatcher(RequestMatcher matcher) {
            skipMatchers.add(new NegatedRequestMatcher(matcher));
            return this;
        }

        public RequestMatcherFilterBase build() {
            List<RequestMatcher> all = new ArrayList<>();
            all.add(new OrRequestMatcher(this.matchers));
            all.addAll(this.skipMatchers);
            return new RequestMatcherFilterBase(new AndRequestMatcher(all));

        }
    }

    private RequestMatcherFilterBase(RequestMatcher requestMatcher) {
        this.requestMatcher = requestMatcher;
    }

    private final RequestMatcher requestMatcher;


    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        if (requestMatcher.matches(request)) {

        }
        filterChain.doFilter(servletRequest, servletResponse);
    }
}
