package com.improver.exception.handler;

import com.improver.exception.*;
import com.improver.exception.NotFoundException;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public class GenericExceptionHandler extends ResponseEntityExceptionHandler {

    private static final String SERVER_ERR_MSG = "Internal Server Error. Please contact support!";

    private final Logger log = LoggerFactory.getLogger(getClass());


    @ExceptionHandler({BadRequestException.class})
    public ResponseEntity<Object> handleBadRequestException(BadRequestException e, WebRequest request) {
        log.warn("Invalid Request Error ", e);
        return new ResponseEntity<>(new RestError(400, e.getMessage()), BAD_REQUEST);
    }

    @ExceptionHandler({AuthenticationRequiredException.class})
    public ResponseEntity<Object> handleAuthenticationRequired(AuthenticationRequiredException e, WebRequest request) {
        return new ResponseEntity<>(new RestError(401, e.getMessage()), UNAUTHORIZED);
    }


    @ExceptionHandler({PaymentFailureException.class})
    public ResponseEntity<Object> handleChargeFailureException(PaymentFailureException e, WebRequest request) {
        log.error("Charge error", e);
        return new ResponseEntity<>(new RestError(402, e.getMessage()), PAYMENT_REQUIRED);
    }

    @ExceptionHandler({AccessDeniedException.class})
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException e, WebRequest request) {
        log.error("Access Denied ", e);
        return new ResponseEntity<>(new RestError(403, e.getMessage()), FORBIDDEN);
    }

    @ExceptionHandler({NotFoundException.class})
    public ResponseEntity<Object> handleNotFoundException(NotFoundException e, WebRequest request) {
        return new ResponseEntity<>(new RestError(404, e.getMessage()), NOT_FOUND);
    }

    @ExceptionHandler({ConflictException.class})
    public ResponseEntity<Object> handleConflictException(ConflictException e, WebRequest request) {
        log.error("Data Conflict Error", e);
        return new ResponseEntity<>(new RestError(409, e.getMessage()), CONFLICT);
    }

    @ExceptionHandler({ConstraintViolationException.class})
    public ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException e, WebRequest request) {
        log.error("Data Conflict Error", e);
        return new ResponseEntity<>(new RestError(409, "Data integrity exception"), CONFLICT);
    }

    @ExceptionHandler({ValidationException.class})
    public ResponseEntity<Object> handleValidationException(ValidationException e, WebRequest request) {
        log.error("Validation Error", e);
        return new ResponseEntity<>(new RestError(422, e.getMessage()), UNPROCESSABLE_ENTITY);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e,
                                                                  HttpHeaders headers, HttpStatus status, WebRequest request) {

        List<ValidationResult> errors = e.getBindingResult().getAllErrors().stream()
            .map(ValidationResult::toResult)
            .collect(Collectors.toList());
        log.error("Invalid Request={}  Data={}", request.getContextPath(), errors);
        List<String> msgs = errors.stream()
            .map(ValidationResult::getMessage)
            .collect(Collectors.toList());
        String message = "Invalid Data. " + msgs;
        return new ResponseEntity<>(new RestError(422, message), UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler({InternalServerException.class})
    public ResponseEntity<Object> handleInternalError(InternalServerException e, WebRequest request) {
        log.error("Internal Server Error ", e);
        return new ResponseEntity<>(new RestError(500, e.getMessage()), INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler({ThirdPartyException.class})
    public ResponseEntity<Object> handleInternalError(ThirdPartyException e, WebRequest request) {
        log.error("Internal Server Error ", e);
        return new ResponseEntity<>(new RestError(500, e.getMessage()), INTERNAL_SERVER_ERROR);
    }

}
