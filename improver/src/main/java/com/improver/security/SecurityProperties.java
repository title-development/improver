package com.improver.security;

import static com.improver.application.properties.Path.REFRESH_ACCESS_TOKEN_PATH;

/**
 * Created by msoltys on 5/30/2017.
 */
public final class SecurityProperties {
    private SecurityProperties() {}
    private static final long MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000L;
    private static final long MILLISECONDS_IN_HOUR = 60 * 60 * 1000L;


    public static final long ACCESS_TOKEN_EXPIRATION = 10 * 60 * 1000L;
    public static final long REFRESH_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000L;
    public static final long ACTIVATION_LINK_EXPIRATION = 2 * MILLISECONDS_IN_DAY;


    public static final String BEARER_TOKEN_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER_NAME = "Authorization";
    public static final String REFRESH_COOKIE_NAME = "imp-ref";
    public static final String REFRESH_COOKIE_PATH = REFRESH_ACCESS_TOKEN_PATH;


    public static final String BAD_CREDENTIALS_MSG = "Email or password is incorrect";
    public static final String SESSION_TIMED_OUT_MSG = "Your session has timed out. Please log in again";
    public static final String ACCOUNT_DELETED_MSG = "Account has been deleted";
    public static final String ACCOUNT_NOT_ACTIVATED_MSG = "Account is not activated. Please proceed to confirm your email";
    public static final String ACCOUNT_BLOCKED_MSG = "Account is blocked. Please contact support";
    public static final String INVALID_ACTIVATION_LINK = "Invalid activation link";

}
