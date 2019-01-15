package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.CD_BOOLEAN;
import static com.improver.util.database.DataAccessUtil.CD_INTEGER;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
public class Subscription {

    @Column(columnDefinition = CD_BOOLEAN)
    private boolean active = false;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime startBillingDate;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime nextBillingDate;

    @Column(columnDefinition = CD_BOOLEAN)
    private boolean autoContinue = false;

    @Column(columnDefinition = CD_INTEGER)
    private int budget;

    @Column(columnDefinition = CD_INTEGER)
    private int nextBudget;

    @Column(columnDefinition = CD_INTEGER)
    private int reserve;

    @Column(columnDefinition = CD_INTEGER)
    private int chargeFailureCount;

    private ZonedDateTime created;

    private ZonedDateTime updated;


    public Subscription cancel(){
        return this.setAutoContinue(false)
            .setNextBudget(0)
            .setUpdated(ZonedDateTime.now());
    }


    public Subscription reset() {
        return this.setActive(false)
            .setAutoContinue(false)
            .setStartBillingDate(null)
            .setNextBillingDate(null)
            .setBudget(0)
            .setNextBudget(0)
            .setReserve(0)
            .setChargeFailureCount(0)
            .setCreated(null);
    }
}
