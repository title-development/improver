package com.improver.security;

import static com.improver.application.properties.Path.REFRESH_ACCESS_TOKEN_PATH;

/**
 * Created by msoltys on 5/30/2017.
 */
public final class SecurityProperties {
    private SecurityProperties() {}

    private static final long MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000L;
    private static final long MILLISECONDS_IN_HOUR = 60 * 60 * 1000L;


    public static final long ACCESS_TOKEN_EXPIRATION = 2 * 60 * 1000L;
    public static final long REFRESH_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000L;
    public static final long ACTIVATION_LINK_EXPIRATION = 2 * MILLISECONDS_IN_DAY;


    public static final String BEARER_TOKEN_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER_NAME = "Authorization";
    public static final String REFRESH_COOKIE_NAME = "imp-ref";
    public static final String REFRESH_COOKIE_PATH = REFRESH_ACCESS_TOKEN_PATH;

}
