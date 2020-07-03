package com.improver.application.properties;

import java.time.Duration;
import java.time.temporal.ChronoUnit;

/**
 * Properties, that can be changed with deep understanding of code and business flow
 *
 */

public class SystemProperties {

    public static final int TRANSACTIONS_NUMBER_MAX_LENGTH = 6;  // should not exceed 13 - based on Long.MAX_VALUE
    public static final Duration tradesCacheDurations = Duration.of(1, ChronoUnit.DAYS);
}
