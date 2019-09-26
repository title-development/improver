package com.improver.model.out.billing;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Transaction;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
@Accessors(chain = true)
public class TransactionModel {

    private String id;
    private Transaction.Type type;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    private String details;
    private String description;
    private int amount;
    private int balance;
    private boolean isManualLead;
    private boolean isCharge;
    @Setter private String chargeId;
    @Setter private String comment;


    public TransactionModel(Transaction transaction) {
        this.id = transaction.getId();
        this.type = transaction.getType();
        this.created = transaction.getCreated();
        this.amount = transaction.getAmount();
        this.balance = transaction.getBalance();
        this.isManualLead = transaction.isManualLead();
        this.details = transaction.generateDetails();
        this.description= transaction.generateDescription();
        this.isCharge = transaction.getChargeId() != null;
    }

    public TransactionModel(Transaction transaction, boolean adminView) {
        this(transaction);
        if (adminView) {
            this.chargeId = transaction.getChargeId();
            this.comment = transaction.getComment();
        }
    }

    /**
     * Outcome regarding to Balance. Charge from card is NOT outcome
     */
    public boolean isOutcome() {
        return type.equals(Transaction.Type.PURCHASE) && !isCharge;
    }




}
