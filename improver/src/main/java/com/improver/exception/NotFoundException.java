package com.improver.exception;


public class NotFoundException extends RuntimeException {

    public NotFoundException() {
        super("Resource not found");
    }

    public NotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public NotFoundException(String message) {
        super(message);
    }

    public NotFoundException(Throwable cause) {
        super(cause);
    }
}
