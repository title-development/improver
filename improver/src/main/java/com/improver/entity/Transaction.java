package com.improver.entity;


import com.improver.util.DecimalConverter;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.application.properties.SystemProperties.TRANSACTIONS_NUMBER_MAX_LENGTH;

@Data
@Entity(name = "transactions")
@Accessors(chain = true)
public class Transaction {
    public static final String BALANCE_SOURCE = "Balance";
    public static final String PURCHASE_DESC = "Purchase";
    public static final String BONUS_DESC = "Bonus";
    public static final String SUBSCRIPTION_REPLENISH_DESC = "Subscription balance top-up";
    public static final String SUBSCRIPTION_RESERVE_DESC = "Subscription budget reservation";
    public static final String TOP_UP_DESC = "Balance top-up";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private long id;

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
    private Location location;
    private String service;
    private boolean isRefunded;

    // Billing
    private int amount;
    private int discount = 0;
    private int balance;
    private String paymentMethod;
    private String chargeId;



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
            case TOP_UP:
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
            case TOP_UP:
                return TOP_UP_DESC;
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
            case TOP_UP:
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

    public static Transaction topupFor(Type type, String comment, Company company, String paymentMethod, String chargeId, int amount, int balance) {
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
        TOP_UP ("TOP_UP"),
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

    /**
     * Transforms transactionNumber from base36 to decimal value
     *
     * @param transactionNumber - base36 value of transactionId
     */
    public static long getIdFromNumber(String transactionNumber) {
        return DecimalConverter.baseXToDecimal(transactionNumber);
    }

    /**
     * Generate transaction number string in base36 format from decimal transactionId
     * For example transactionId equal "758" => "0000LT"
     * Where:  "LT" -  758 decimal value in base36 format
     *         "0000" - zeros to fill standard of transactions number length
     */
    public String getTransactionNumber() {
        String base36Id = DecimalConverter.decimalToBaseX(this.id);
        StringBuilder stringWithZeros = new StringBuilder();
        char[] hexadecimalCharArray = base36Id.toCharArray();
        if (hexadecimalCharArray.length < TRANSACTIONS_NUMBER_MAX_LENGTH) {
            for (int i = 0; i < TRANSACTIONS_NUMBER_MAX_LENGTH - hexadecimalCharArray.length; i++) {
                stringWithZeros.append('0');
            }
        }
        return stringWithZeros + base36Id;
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
}
