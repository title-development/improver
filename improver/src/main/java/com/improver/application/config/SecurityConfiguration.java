package com.improver.application.config;

import com.improver.application.properties.SecurityProperties;
import com.improver.filter.MDCFilter;
import com.improver.security.*;
import com.improver.service.ReCaptchaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static com.improver.application.properties.Path.*;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfiguration {

    @Autowired
    UserSecurityService userSecurityService;
    @Autowired
    JwtUtil jwtUtil;
    @Autowired
    SecurityProperties securityProperties;
    @Autowired
    ReCaptchaService reCaptchaService;
    @Autowired
    MDCFilter mdcFilter;
    @Autowired
    @Lazy
    AuthenticationManager authenticationManager;

    private LoginFilter loginFilter() throws Exception {
        return new LoginFilter(LOGIN_PATH, authenticationManager, userSecurityService, reCaptchaService, securityProperties);
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


    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) ->

            web.ignoring()
                // For ELB that accepts only 200 response while application health check through 8080 port
                // (the only port opened right now in our embedded tomcat)
                .requestMatchers(HttpMethod.GET, HEATH_CHECK_PATH)
                .requestMatchers(HttpMethod.GET, "/*")
                .requestMatchers(HttpMethod.GET, IMAGES_PATH + "/*/**")

                // for angular
                .requestMatchers(HttpMethod.GET, "/vendor.js")
                .requestMatchers(HttpMethod.GET, "/styles.js")
                .requestMatchers(HttpMethod.GET, "/polyfills.js")
                .requestMatchers(HttpMethod.GET, "/inline.js")
                .requestMatchers(HttpMethod.GET, "/scripts.js")
                .requestMatchers(HttpMethod.GET, "/main.js")
                // for Swagger
                .requestMatchers(HttpMethod.GET, "/swagger-*/**")
                .requestMatchers(HttpMethod.GET, "/webjars*/**")
                .requestMatchers(HttpMethod.GET, "/v2/api-docs");
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // if we don't use cookies for authorization, CSRF is not an issue
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/").permitAll()
                .requestMatchers(HttpMethod.POST, LOGIN_PATH).anonymous()
                //.requestMatchers(REGISTRATION_PATH + "/**").anonymous()
                .requestMatchers(HttpMethod.GET, PRINCIPAL_PATH).permitAll()
                .requestMatchers(LOGOUT_PATH).authenticated()
                .requestMatchers(WEB_SOCKET_ENDPOINT).authenticated()
                .requestMatchers(HttpMethod.GET, SERVICES_PATH + "/**").permitAll()
                .requestMatchers(HttpMethod.GET, TRADES_PATH + "/**").permitAll()
                .anyRequest().permitAll()
            )
            // don't create session
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // If the token is sent in the Authorization header, Cross-Origin Resource Sharing (CORS) won't be an issue as it doesn't use cookies.
            // And filter other requests to check the presence of JWT in header
            .addFilterBefore(mdcFilter, AnonymousAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter(), AnonymousAuthenticationFilter.class)
            .addFilterAt(loginFilter(), JwtAuthenticationFilter.class)
            .addFilterAt(new LogoutFilter(LOGOUT_PATH, userSecurityService), JwtAuthenticationFilter.class)
            .addFilterBefore(refreshAccessTokenFilter(), JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userSecurityService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
}
