package com.improver.entity;


import lombok.Data;
import lombok.experimental.Accessors;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.ZonedDateTime;

@Data
@Entity(name = "transactions")
@Accessors(chain = true)
public class Transaction {

    @Id
    @GeneratedValue(generator = "ip-time-based-id")
    @GenericGenerator(name = "ip-time-based-id", strategy = "com.improver.util.database.IPAndTimeBasedIdGenerator")
    @Column(name = "id", nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", foreignKey = @ForeignKey(name = "transaction_company_fkey"))
    private Company company;

    @Enumerated(EnumType.STRING)
    private Type type;

    private ZonedDateTime created = ZonedDateTime.now();

    private String comment;

    @ManyToOne
    @JoinColumn(name = "project_request_id", foreignKey = @ForeignKey(name = "transaction_project_request_fkey"))
    private ProjectRequest projectRequest;

    // Project
    private boolean isManualLead;
    private String customer;
    private Location location;
    private String service;
    private boolean isRefunded;

    // Billing
    private int amount;
    private int balance;
    private String paymentMethod;
    private String chargeId;

    public static final String BALANCE_SOURCE = "Balance";
    public static final String PURCHASE_DESC = "Purchase";
    public static final String BONUS_DESC = "Bonus";
    public static final String SUBSCRIPTION_REPLENISH_DESC = "Subscription balance replenishment";
    public static final String SUBSCRIPTION_RESERVE_DESC = "Subscription budget reservation";
    public static final String REPLENISHMENT_DESC = "Balance replenishment";

    private Transaction() {
    }

    public boolean isCharge() {
        return chargeId != null;
    }


    public String generateRecordTitle() {
        switch (type) {
            case RETURN:
                return "Credit Return";
            case PURCHASE:
                return isManualLead ? "Lead Purchase" : "Subscription Lead Purchase";
            case BONUS:
                return "Bonus Credit";
            case SUBSCRIPTION:
                return generateDescription();
            case REPLENISHMENT:
                return generateDescription();
            default:
                throw new IllegalArgumentException(type.toString());
        }
    }

    public String generateDescription() {
        switch (type) {
            case RETURN:
                return service;
            case PURCHASE:
                return service;
            case BONUS:
                return BONUS_DESC;
            case SUBSCRIPTION:
                return (amount > 0) ? SUBSCRIPTION_REPLENISH_DESC : SUBSCRIPTION_RESERVE_DESC;
            case REPLENISHMENT:
                return REPLENISHMENT_DESC;
            default:
                throw new IllegalArgumentException(type.toString());
        }
    }

    public String generateDetails() {
        switch (type) {
            case RETURN:
                return location.asText();
            case PURCHASE:
                return location.asText();
            case BONUS:
                return comment;
            case SUBSCRIPTION:
                return (!isCharge()) ? comment : paymentMethod;
            case REPLENISHMENT:
                return paymentMethod;
            default:
                throw new IllegalArgumentException(type.toString());
        }
    }

    public static Transaction bonus(Company company, int amount, int balance, String comment) {
        return new Transaction().setType(Type.BONUS)
            .setCompany(company)
            .setAmount(amount)
            .setBalance(balance)
            .setComment(comment);
    }

    public static Transaction replenishmentFor(Type type, String comment, Company company, String paymentMethod, String chargeId, int amount, int balance) {
        return new Transaction().setType(type)
            .setComment(comment)
            .setPaymentMethod(paymentMethod)
            .setChargeId(chargeId)
            .setCompany(company)
            .setAmount(amount)
            .setBalance(balance);
    }

    public static Transaction purchase(Company company, String serviceType, Location location, ProjectRequest projectRequest, int price, String paymentMethod, String chargeId, boolean isManualLead, int balance) {
        return new Transaction().setType(Type.PURCHASE)
            .setCompany(company)
            .setService(serviceType)
            .setLocation(location)
            .setProjectRequest(projectRequest)
            .setPaymentMethod(paymentMethod)
            .setChargeId(chargeId)
            .setManualLead(isManualLead)
            .setAmount(price)
            .setBalance(balance);
    }

    public static Transaction subscriptionBalance(Company company, String comment, int balance) {
        return new Transaction().setType(Type.SUBSCRIPTION)
            .setCompany(company)
            .setPaymentMethod(BALANCE_SOURCE)
            .setAmount(0)
            .setComment(comment)
            .setBalance(balance);

    }

    public static Transaction refund(ProjectRequest projectRequest, boolean isManualLead, int price, int balance, String comment) {

        return new Transaction().setType(Type.RETURN)
            .setCompany(projectRequest.getContractor().getCompany())
            .setService(projectRequest.getProject().getServiceType().getName())
            .setLocation(projectRequest.getProject().getLocation())
            .setProjectRequest(projectRequest)
            .setComment(comment)
            .setPaymentMethod(BALANCE_SOURCE)
            .setManualLead(isManualLead)
            .setAmount(price)
            .setBalance(balance);
    }

    /**
     * Transaction Type
     */
    public enum Type {
        BONUS("BONUS"),
        SUBSCRIPTION ("SUBSCRIPTION"),
        REPLENISHMENT ("REPLENISHMENT"),
        PURCHASE ("PURCHASE"),
        RETURN ("RETURN");

        private final String value;

        Type(String type) {
            value = type;
        }

        public boolean equalsValue(String type) {
            return value.equals(type);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }

    public static Transaction leadFromCard(Company company, String serviceType, ProjectRequest projectRequest, Location location, int amount, int balance, String paymentMethod, String chargeId) {
        return new Transaction().setType(Type.PURCHASE)
            .setChargeId(chargeId)
            .setManualLead(true)
            .setService(serviceType)
            .setPaymentMethod(paymentMethod)
            .setCompany(company)
            .setProjectRequest(projectRequest)
            .setLocation(location)
            .setAmount(amount)
            .setBalance(balance);
    }

    public static Transaction leadFromBalance(boolean isManual, Company company, String serviceType, ProjectRequest projectRequest, Location location, int amount, int balance) {
        return new Transaction().setType(Type.PURCHASE)
            .setManualLead(isManual)
            .setService(serviceType)
            .setPaymentMethod(BALANCE_SOURCE)
            .setCompany(company)
            .setProjectRequest(projectRequest)
            .setLocation(location)
            .setAmount(amount)
            .setBalance(balance);
    }

    public static Transaction leadSubscription(Company company, String serviceType, ProjectRequest projectRequest, Location location, int amount, int balance) {
        return new Transaction().setType(Type.PURCHASE)
            .setManualLead(false)
            .setPaymentMethod(BALANCE_SOURCE)
            .setService(serviceType)
            .setCompany(company)
            .setProjectRequest(projectRequest)
            .setLocation(location)
            .setAmount(amount)
            .setBalance(balance);
    }
}
