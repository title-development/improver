package com.improver.application.properties;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

/**
 * Properties, that can be changed with deep understanding of code and business flow
 *
 */
public class SystemProperties {

    public static final int MIN_STRIPE_CHARGE_CENTS = 50;
    public static final int TRANSACTIONS_NUMBER_MAX_LENGTH = 6;  // should not exceed 13 - based on Long.MAX_VALUE
    public static final Duration ADVERTISED_TRADES_CACHE_EXPIRATION = Duration.of(1, ChronoUnit.DAYS);
    public static final Duration IMAGES_CACHE_DURATION = Duration.of(30, ChronoUnit.DAYS);
    public static final Duration SERVICE_CATALOG_CACHE_DURATION = Duration.of(1, ChronoUnit.DAYS);


    public static final String MDC_USERNAME_KEY = "username";                       // used in logs
    public static final String MDC_REQUEST_ID_KEY = "requestId";                    // used in logs
    public static final String WS_INVALID_TOKEN_ERROR = "403 Valid token required"; // used on front-end side
    public static final String WS_TOKEN_EXPIRED_ERROR = "401 Token expired";        // used on front-end side


}
