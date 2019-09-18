package com.improver.util;

import static com.improver.util.database.DataAccessUtil.*;
import static com.improver.util.database.DataAccessUtil.COMPANY_DESCRIPTION_MAX_SIZE;

public final class ErrorMessages {

    private ErrorMessages(){}

    public static final String ERR_MSG_PASS_MINIMUM_REQUIREMENTS = "Password doesn't match minimum security requirements";
    public static final String EMAIL_VALIDATION_ERROR_MESSAGE = "Email is not a valid";
    public static final String EMAIL_REQUIRED_VALIDATION_ERROR_MESSAGE = "Email is required";
    public static final String NAME_PATTERN_ERROR_MESSAGE = "May contain only letters, numbers and characters: ' -";
    public static final String PHONE_PATTERN_ERROR_MESSAGE = "Phone number format should be xxx-xxx-xxxx";
    public static final String COMPANY_FOUNDATION_ERROR_MESSAGE = "Company foundation year should be valid";
    public static final String COMPANY_NAME_SIZE_ERROR_MESSAGE = "Company name should be between " + COMPANY_NAME_MIN_SIZE + " and" + COMPANY_NAME_MAX_SIZE + "characters";
    public static final String COMPANY_DESCRIPTION_SIZE_ERROR_MESSAGE = "Company description must be between " + COMPANY_DESCRIPTION_MIN_SIZE + " and" + COMPANY_DESCRIPTION_MAX_SIZE + "characters";
    public static final String COMPANY_COVERAGE_RADIUS_ERROR_MESSAGE = "Radius of Service Area should be between " + COMPANY_COVERAGE_MIN_RADIUS + " and " + COMPANY_COVERAGE_MAX_RADIUS + " miles";
    public static final String CUSTOMER_REVIEW_SIZE_ERROR_MESSAGE = "Message should be " + REVIEW_MESSAGE_MIN_SIZE + " to " + REVIEW_MESSAGE_MAX_SIZE + " characters long.";
    public static final String REQUEST_REVIEW_SUBJECT_SIZE_ERROR_MESSAGE = "Subject should be " + REVIEW_REQUEST_SUBJECT_MIN_SIZE + " to " + REVIEW_REQUEST_SUBJECT_MAX_SIZE + " characters long.";
    public static final String REQUEST_REVIEW_MESSAGE_SIZE_ERROR_MESSAGE = "Message should be " + REVIEW_REQUEST_MESSAGE_MIN_SIZE + " to " + REVIEW_REQUEST_MESSAGE_MAX_SIZE + " characters long.";
    public static final String ORDER_DESCRIPTION_SIZE_ERROR_MESSAGE = "Order description must be not more " + ORDER_DESCRIPTION_SIZE + " characters";
    public static final String RE_CAPTCHA_VALIDATION_ERROR_MESSAGE = "You did not pass captcha";


    public static final String BAD_CREDENTIALS_MSG = "Email or password is incorrect";
    public static final String SESSION_TIMED_OUT_MSG = "Your session has timed out. Please log in again";
    public static final String ACCOUNT_DELETED_MSG = "Account has been deleted";
    public static final String ACCOUNT_NOT_ACTIVATED_MSG = "Account is not activated. Please proceed to confirm your email";
    public static final String ACCOUNT_BLOCKED_MSG = "Account is blocked. Please contact support";
    public static final String INVALID_ACTIVATION_LINK = "Invalid activation link";
    public static final String CREDENTIALS_EXPIRED_MSG = "Password has been expired. Please change it";
}
