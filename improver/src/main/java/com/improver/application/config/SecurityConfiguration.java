package com.improver.application.config;

import com.improver.application.properties.SecurityProperties;
import com.improver.filter.MDCFilter;
import com.improver.security.*;
import com.improver.service.ReCaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static com.improver.application.properties.Path.*;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled=true)
public class SecurityConfiguration extends WebSecurityConfigurerAdapter {

    @Autowired UserSecurityService userSecurityService;
    @Autowired JwtUtil jwtUtil;
    @Autowired SecurityProperties securityProperties;
    @Autowired ReCaptchaService reCaptchaService;
    @Autowired MDCFilter mdcFilter;

    private LoginFilter loginFilter() throws Exception {
        return new LoginFilter(LOGIN_PATH, authenticationManager(), userSecurityService, reCaptchaService, securityProperties);
    }

    private JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, securityProperties)
            .addMatcher(new AntPathRequestMatcher(API_PATH_PREFIX + "/**"))
            .addMatcher(new AntPathRequestMatcher(WEB_SOCKET_ENDPOINT))
            .skipMatcher(new AntPathRequestMatcher(IMAGES_PATH + "/*/**", HttpMethod.GET.toString()))
            .skipMatcher(new AntPathRequestMatcher(CATALOG_PATH + "/**", HttpMethod.GET.toString()))
            .build();
    }

    private RefreshAccessTokenFilter refreshAccessTokenFilter() {
        return new RefreshAccessTokenFilter(REFRESH_ACCESS_TOKEN_PATH, userSecurityService, securityProperties);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    //Fix for preflight OPTIONS for api calls
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(securityProperties.getAllowedOrigins());
        configuration.setAllowedHeaders(Arrays.asList("Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowedMethods(Arrays.asList("OPTIONS", "GET", "POST", "PUT", "DELETE"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        source.registerCorsConfiguration("/ws/**", configuration);
        return source;
    }


    @Override
    public void configure(WebSecurity web) {
        web.ignoring()
            // For ELB that accepts only 200 response while application health check through 8080 port
            // (the only port opened right now in our embedded tomcat)
            .antMatchers(HttpMethod.GET, HEATH_CHECK_PATH)
            .antMatchers(HttpMethod.GET, "/*")
            .antMatchers(HttpMethod.GET, IMAGES_PATH + "/*/**")

            // for angular
            .antMatchers(HttpMethod.GET, "/vendor.js")
            .antMatchers(HttpMethod.GET, "/styles.js")
            .antMatchers(HttpMethod.GET, "/polyfills.js")
            .antMatchers(HttpMethod.GET, "/inline.js")
            .antMatchers(HttpMethod.GET, "/scripts.js")
            .antMatchers(HttpMethod.GET, "/main.js")
            // for Swagger
            .antMatchers(HttpMethod.GET, "/swagger-*/**")
            .antMatchers(HttpMethod.GET, "/webjars*/**")
            .antMatchers(HttpMethod.GET, "/v2/api-docs");
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            // Require HTTPS for all requests
            .requiresChannel().anyRequest().requiresSecure().and()
            .cors().and() // If the token is sent in the Authorization header, Cross-Origin Resource Sharing (CORS) won't be an issue as it doesn't use cookies.
            .csrf().disable() // if we don't use cookies for authorization, CSRF is not an issue
            // don't create session
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
                .antMatchers(HttpMethod.GET, "/").permitAll()
                .antMatchers(HttpMethod.POST, LOGIN_PATH).anonymous()
                //.antMatchers(REGISTRATION_PATH + "/**").anonymous()
                .antMatchers(HttpMethod.GET, PRINCIPAL_PATH).permitAll()
                .antMatchers(LOGOUT_PATH).authenticated()
                .antMatchers(WEB_SOCKET_ENDPOINT).authenticated()
                .antMatchers(HttpMethod.GET, SERVICES_PATH + "/**").permitAll()
                .antMatchers(HttpMethod.GET, TRADES_PATH + "/**").permitAll()
            .anyRequest().permitAll()
            .and()
            // And filter other requests to check the presence of JWT in header
            .addFilterBefore(mdcFilter, AnonymousAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter(), AnonymousAuthenticationFilter.class)
            .addFilterAt(loginFilter(), JwtAuthenticationFilter.class)
            .addFilterAt(new LogoutFilter(LOGOUT_PATH, userSecurityService), JwtAuthenticationFilter.class)
            .addFilterBefore(refreshAccessTokenFilter(), JwtAuthenticationFilter.class)
        ;
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userSecurityService)
            .passwordEncoder(passwordEncoder());
    }
}
