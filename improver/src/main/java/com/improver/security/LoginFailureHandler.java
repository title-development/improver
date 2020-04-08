package com.improver.security;

import com.improver.exception.CaptchaValidationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import static com.improver.util.ErrorMessages.*;

public class LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Override
    public void onAuthenticationFailure(HttpServletRequest request,
                                        HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

        String message;
        if(exception instanceof BadCredentialsException) {
            message = BAD_CREDENTIALS_MSG;
        } else if(exception instanceof LockedException) {
            message = ACCOUNT_BLOCKED_MSG;
        } else if(exception instanceof DisabledException) {
            message = ACCOUNT_NOT_ACTIVATED_MSG;
        } else if(exception instanceof AccountExpiredException) {
            message = ACCOUNT_DELETED_MSG;
        } else if(exception instanceof CredentialsExpiredException) {
            message = CREDENTIALS_EXPIRED_MSG;
        } else if(exception instanceof CaptchaValidationException) {
            message = CAPTCHA_VALIDATION_ERROR_MESSAGE;
        } else {
            message = BAD_CREDENTIALS_MSG;
        }
        //TODO: may need to send allow origins header
        response.sendError(HttpStatus.UNAUTHORIZED.value(), message);

    }
}
