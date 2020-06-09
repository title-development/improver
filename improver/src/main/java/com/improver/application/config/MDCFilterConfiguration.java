package com.improver.application.config;

import com.improver.filter.MDCFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MDCFilterConfiguration {

    @Bean
    public FilterRegistrationBean servletRegistrationBean(MDCFilter MDCFilter) {
        final FilterRegistrationBean registrationBean = new FilterRegistrationBean();
        registrationBean.setFilter(MDCFilter);
        registrationBean.setOrder(5);
        return registrationBean;
    }
}
