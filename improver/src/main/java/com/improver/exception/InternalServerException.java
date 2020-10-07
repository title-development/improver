package com.improver.exception;

import lombok.Getter;

public class InternalServerException extends RuntimeException {
    @Getter
    private final boolean logMessageInAdvice;

    public InternalServerException(String message) {
        super(message);
        logMessageInAdvice = false;
    }

    public InternalServerException(String message, Throwable cause) {
        super(message, cause);
        logMessageInAdvice = true;
    }
}
