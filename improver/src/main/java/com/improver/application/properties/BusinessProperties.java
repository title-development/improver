package com.improver.application.properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.time.Period;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAmount;

@Component
public class BusinessProperties {

    public static final int MONTHS_STATISTIC_COUNT = 7;
    public static final int MIN_SUBSCRIPTION = 100 * 100; // in cents
    public static final int SUBSCRIPTION_CHARGE_ATTEMPTS = 3;
    public static final int REFERRAL_BONUS_AMOUNT = 100 * 100;

    public static final int DAYS_TO_ACCEPT_REFUND = 30;                 // After this period no refunds will be allowed
    public static final int RELAPSE_PROJECT_COUNT = 15;                 // Count of projects that will be scanned for relapse of issue
    public static final int RELAPSE_TERM_DAYS = 30;                     // Past period to scan projects for relapse of issue
    public static final int SCHEDULING_DAYS = 7;                        // Days to schedule meeting with Customer
    public static final int ATTEMPTS_TO_RELAPSE = 2;                    // Max allowed attempts will be not count as relapse of issue
    public static final int DUPLICATED_PROJECT_DEVIATION_MINUTES = 30;  // Deviation of duplicated project search period (for example +/-30 minutes)

    public static final int NEGATIVE_REVIEW_PREPUBLISH_DAYS = 14;       // Period while negative review will stay unpublished
    public static final int NEGATIVE_REVIEW_RATING_LIMIT = 3;           // Top limit of negative review rating

    public static final int MAX_AVAILABLE_CARDS_COUNT = 5;

    public static final int MAX_REQUEST_REVIEWS = 5;
    public static final int DEFAULT_COMPANY_COVERAGE_RADIUS = 15;


    @Value("${subscription.period}")
    private Duration subscriptionPeriodInternal;

    public TemporalAmount getSubscriptionPeriod() {
        if (subscriptionPeriodInternal.equals(Duration.ofDays(30))) {
            return Period.ofMonths(1);
        }
        return subscriptionPeriodInternal;

    }

    /**
     * This is required for {@link com.improver.job.SubscriptionUpdateJob#updateSubscription()}
     */
    public ChronoUnit getSubsBillingDateTruncate() {
        if (Period.ofMonths(1).equals(getSubscriptionPeriod())) {
            return ChronoUnit.DAYS;
        }
        if (subscriptionPeriodInternal.compareTo(Duration.ofDays(1)) > 0) {
            return ChronoUnit.DAYS;
        }
        if (subscriptionPeriodInternal.compareTo(Duration.ofHours(1)) > 0) {
            return ChronoUnit.HOURS;
        }
        if (subscriptionPeriodInternal.compareTo(Duration.ofMinutes(1)) > 0) {
            return ChronoUnit.MINUTES;
        }
        if (subscriptionPeriodInternal.compareTo(Duration.ofSeconds(1)) > 0) {
            return ChronoUnit.SECONDS;
        }
        throw new IllegalArgumentException("Subscription period could not be duration of " + subscriptionPeriodInternal);
    }
}
