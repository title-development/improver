package com.improver.exception.handler;

import lombok.Data;
import lombok.experimental.Accessors;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;

@Data
@Accessors(chain = true)
public class ValidationResult {
    private String field;
    private String rejectedValue;
    private String message;


    public static ValidationResult of(FieldError fieldError) {
        return new ValidationResult()
            .setField(fieldError.getField())
            .setRejectedValue(fieldError.getRejectedValue().toString())
            .setMessage(fieldError.getDefaultMessage());
    }

    public static ValidationResult of(ObjectError objectError) {
        return new ValidationResult()
            .setField(objectError.getObjectName())
            .setRejectedValue("Fields=" + objectError.getArguments().toString())
            .setMessage(objectError.getDefaultMessage());
    }


    public static ValidationResult toResult(ObjectError objectError) {
        if (objectError instanceof FieldError) {
            FieldError fieldError = (FieldError) objectError;
            return ValidationResult.of(fieldError);
        } else {
            return ValidationResult.of(objectError);
        }
    }

    public String toMessage() {
        return "error{" +
            "field='" + field + '\'' +
            ", message='" + message + '\'' +
            '}';
    }


    @Override
    public String toString() {
        return "ValidationResult{" +
            "field='" + field + '\'' +
            ", rejectedValue='" + rejectedValue + '\'' +
            ", message='" + message + '\'' +
            '}';
    }
}
