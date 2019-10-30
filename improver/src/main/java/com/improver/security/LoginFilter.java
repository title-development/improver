package com.improver.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.model.out.LoginModel;
import com.improver.model.recapcha.ReCaptchaResponse;
import com.improver.service.ReCaptchaService;
import com.improver.util.serializer.SerializationUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

import static com.improver.util.ErrorMessages.RE_CAPTCHA_VALIDATION_ERROR_MESSAGE;

public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private UserSecurityService userSecurityService;
    private ReCaptchaService reCaptchaService;

    public LoginFilter(String url, AuthenticationManager authManager, UserSecurityService userSecurityService, ReCaptchaService reCaptchaService) {
        super(new AntPathRequestMatcher(url));
        setAuthenticationManager(authManager);
        this.userSecurityService = userSecurityService;
        this.reCaptchaService = reCaptchaService;
        this.setAuthenticationFailureHandler(new LoginFailureHandler());
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res) throws AuthenticationException, IOException, ServletException {
        String userIp = req.getRemoteAddr();
        Credentials creds = new ObjectMapper().readValue(req.getInputStream(), Credentials.class);

        ReCaptchaResponse reCaptchaResponse = reCaptchaService.validate(creds.getCaptcha(), userIp);
        if(!reCaptchaResponse.isSuccess()) {
            throw new AuthenticationRequiredException(RE_CAPTCHA_VALIDATION_ERROR_MESSAGE);
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
