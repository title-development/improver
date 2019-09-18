package com.improver.exception;

public class RecaptchaValidationException extends RuntimeException {
    public RecaptchaValidationException(String message) { super(message); }
    public RecaptchaValidationException(String message, Throwable e) {
        super(message, e);
    }
}
