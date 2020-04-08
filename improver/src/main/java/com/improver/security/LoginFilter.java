package com.improver.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.improver.application.properties.SecurityProperties;
import com.improver.entity.User;
import com.improver.exception.CaptchaValidationException;
import com.improver.model.out.LoginModel;
import com.improver.model.recapcha.ReCaptchaResponse;
import com.improver.service.ReCaptchaService;
import com.improver.util.serializer.SerializationUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private UserSecurityService userSecurityService;
    private ReCaptchaService reCaptchaService;
    private SecurityProperties securityProperties;

    public LoginFilter(String url, AuthenticationManager authManager, UserSecurityService userSecurityService, ReCaptchaService reCaptchaService, SecurityProperties securityProperties) {
        super(new AntPathRequestMatcher(url));
        setAuthenticationManager(authManager);
        this.userSecurityService = userSecurityService;
        this.reCaptchaService = reCaptchaService;
        this.securityProperties = securityProperties;
        this.setAuthenticationFailureHandler(new LoginFailureHandler());
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res) throws AuthenticationException, IOException, ServletException {
        String userIp = req.getRemoteAddr();
        Credentials creds = new ObjectMapper().readValue(req.getInputStream(), Credentials.class);

        if (securityProperties.isCaptchaEnabled()){
            ReCaptchaResponse reCaptchaResponse = reCaptchaService.validate(creds.getCaptcha(), userIp);
            if(!reCaptchaResponse.isSuccess()) {
                throw new CaptchaValidationException();
            }
        }

        return getAuthenticationManager().authenticate(
            new UsernamePasswordAuthenticationToken(
                creds.getEmail().toLowerCase(),
                creds.getPassword(),
                Collections.emptyList()
            )
        );
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain chain, Authentication auth) throws IOException, ServletException {
        User user = userSecurityService.getByEmail(auth.getName());
        LoginModel loginModel = userSecurityService.performUserLogin(user, res);
        SerializationUtil.mapper().writeValue(res.getOutputStream(), loginModel);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Authentication request failed: " + failed.getMessage());
        }
        getFailureHandler().onAuthenticationFailure(request, response, failed);
    }

    private static class Credentials {
        private String email;
        private String password;
        private String captcha;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getCaptcha() {
            return captcha;
        }

        public void setCaptcha(String captcha) {
            this.captcha = captcha;
        }
    }
}
