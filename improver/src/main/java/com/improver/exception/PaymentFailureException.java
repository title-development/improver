package com.improver.exception;

/** Is thrown when charge is done but its status is failed
 * @author Taras Halynskyi
 */
public class PaymentFailureException extends RuntimeException {

    public PaymentFailureException(String message) {
        super(message);
    }

    public PaymentFailureException(String message, Throwable e) {
        super(message, e);
    }

}
