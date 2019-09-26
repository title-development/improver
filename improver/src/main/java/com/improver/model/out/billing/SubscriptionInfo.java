package com.improver.model.out.billing;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Subscription;
import lombok.Getter;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
public class SubscriptionInfo {

    private final boolean active;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private final ZonedDateTime startBillingDate;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private final ZonedDateTime nextBillingDate;
    private final boolean autoContinue;
    private final int budget;
    private final int nextBudget;
    private final int reserve;
    private final int spent;
    private final int dealsCount;
    private final int chargeFailureCount;

    public SubscriptionInfo(Subscription subscription, int dealsCount) {
        this.active = subscription.isActive();
        this.startBillingDate = subscription.getStartBillingDate();
        this.nextBillingDate = subscription.getNextBillingDate();
        this.autoContinue = subscription.isAutoContinue();
        this.budget = subscription.getBudget();
        this.nextBudget = subscription.getNextBudget();
        this.reserve = subscription.getReserve();
        this.spent = subscription.getBudget() - subscription.getReserve();
        this.dealsCount = dealsCount;
        this.chargeFailureCount = subscription.getChargeFailureCount();
    }
}
