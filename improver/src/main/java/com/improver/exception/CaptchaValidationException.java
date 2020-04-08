package com.improver.exception;

import org.springframework.security.core.AuthenticationException;

import static com.improver.util.ErrorMessages.CAPTCHA_VALIDATION_ERROR_MESSAGE;

public class CaptchaValidationException extends AuthenticationException {

    public CaptchaValidationException(String msg, Throwable t) {
        super(msg, t);
    }

    public CaptchaValidationException(String msg) {
        super(msg);
    }

    public CaptchaValidationException() {
        super(CAPTCHA_VALIDATION_ERROR_MESSAGE);
    }

}
