package com.improver.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.improver.entity.User;
import com.improver.model.out.LoginModel;
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

import static com.improver.security.SecurityProperties.AUTHORIZATION_HEADER_NAME;
import static com.improver.security.SecurityProperties.BEARER_TOKEN_PREFIX;

public class LoginFilter extends AbstractAuthenticationProcessingFilter {

    private UserSecurityService userSecurityService;
    private JwtUtil jwtUtil;

    public LoginFilter(String url, AuthenticationManager authManager, UserSecurityService userSecurityService, JwtUtil jwtUtil1) {
        super(new AntPathRequestMatcher(url));
        setAuthenticationManager(authManager);
        this.userSecurityService = userSecurityService;
        this.jwtUtil = jwtUtil1;
        this.setAuthenticationFailureHandler(new LoginFailureHandler());
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest req, HttpServletResponse res) throws AuthenticationException, IOException, ServletException {
        Credentials creds = new ObjectMapper().readValue(req.getInputStream(), Credentials.class);
        return getAuthenticationManager().authenticate(
            new UsernamePasswordAuthenticationToken(
                creds.getEmail().toLowerCase(),
                creds.getPassword(),
                Collections.emptyList()
            )
        );
    }

    @Override
    @Deprecated
    protected void successfulAuthentication(HttpServletRequest req, HttpServletResponse res, FilterChain chain, Authentication auth) throws IOException, ServletException {
        User user = userSecurityService.getByEmail(auth.getName());
        LoginModel loginModel = userSecurityService.updateLoggedUser(user);
        String jwt  = jwtUtil.generateAccessJWT(user.getEmail(), loginModel.getRole()); // TODO: Misha
        res.addHeader(AUTHORIZATION_HEADER_NAME, BEARER_TOKEN_PREFIX + jwt);
        res.addCookie(TokenProvider.buildRefreshCookie(loginModel.getRefreshId()));
        SerializationUtil.mapper().writeValue(res.getOutputStream(), loginModel);
    }


    private static class Credentials {
        private String email;
        private String password;

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
    }
}
