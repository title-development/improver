package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.*;

import static com.improver.entity.Refund.Option.*;

@Data
@Accessors(chain = true)
@Entity(name = "refunds")
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @OneToOne(mappedBy="refund")
    private ProjectRequest projectRequest;

    @Enumerated(EnumType.STRING)
    private Issue issue;

    @Enumerated(EnumType.STRING)
    private Option option;

    private String comment;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String notes;

    private ZonedDateTime created;

    private ZonedDateTime updated;

    @JsonIgnore
    @OneToMany(mappedBy = "refund")
    private List<RefundAction> refundActions;

    public boolean isApproved() {
        return status.equals(Status.APPROVED) || status.equals(Status.AUTO_APPROVED);
    }

    /**
     * Refund Status
     */
    public enum Status {
        IN_REVIEW("IN_REVIEW"),
        REJECTED("REJECTED"),
        APPROVED("APPROVED"),
        AUTO_REJECTED("AUTO_REJECTED"),
        AUTO_APPROVED("AUTO_APPROVED");

        private final String value;

        Status(String status) {
            this.value = status;
        }

        public String getPhrase() {
            return this.value;
        }

        @Override
        public String toString() {
            return this.value;
        }
    }


    /**
     * Refund Issue
     */
    public enum Issue {
        WRONG_ZIP("I don’t work in {zip}"),
        WRONG_SERVICE("I don’t do {serviceName}"),
        WONT_DO("I don’t do this particular service"),
        NOT_AGREED("I talked to client, but we aren't doing the job"),
        INVALID_LEAD("I couldn't contact the customer. Invalid lead");

        private final String value;

        //        move ot Refund and make not static
        private static Map<Issue, List<Option>> options = new LinkedHashMap<>();

        static {
            options.put(WRONG_ZIP, Arrays.asList(
                NEVER_WORK_IN_ZIP,
                SOMETIMES_WORK_IN_ZIP,
                JOB_NOT_FOR_ZIP)
            );
            options.put(WRONG_SERVICE, Arrays.asList(
                NEVER_DO_SERVICE,
                SOMETIMES_DO_SERVICE,
                JOB_NOT_FOR_SERVICE)
            );
            options.put(WONT_DO, Arrays.asList(
                JOB_TOO_SMALL,
                NOT_EQUIPPED,
                JOB_NOT_FOR_SERVICE,
                OTHER)
            );
            options.put(NOT_AGREED, Arrays.asList(
                NOT_READY_TO_HIRE,
                DECLINED,
                NOT_SCHEDULED,
                NOT_AGREED_PRICE,
                NOT_EQUIPPED,
                JOB_TOO_SMALL,
                NOTHING_TO_DO,
                CLOSED,
                OTHER)
            );
            options.put(INVALID_LEAD, Arrays.asList(
                NO_RESPOND,
                NOT_READY_TO_HIRE,
                DUPLICATE,
                NOT_ENOUGH_INFO,
                BAD_CONTACT_INFO,
                NOTHING_TO_DO,
                DECLINED,
                CLOSED)
            );
        }

        Issue(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public boolean equalsValue(String value) {
            return this.value.equals(value);
        }

        public String getQuestion() {
            switch (this) {
                case WRONG_ZIP:  return "Do you want to remove {zip} from your coverage? By doing so, you will no longer receive leads for {zip}.";
                case WRONG_SERVICE:  return "Do you want to remove {serviceName} from your service list? By doing so, you will no longer receive leads for {serviceName}.";
                case WONT_DO:  return "Why not?";
                case NOT_AGREED:  return "Why not?";
                case INVALID_LEAD:  return "Why is this lead invalid?";
                default: throw new IllegalArgumentException();
            }
        }

        public List<Option> getOptions() {
            return options.get(this);
        }

        public static Map<Issue, List<Option>> getAllOptions() {
            return options;
        }

        @Override
        public String toString() {
            return this.value;
        }
    }


    public enum Option {
        NEVER_WORK_IN_ZIP("Yes, I never work there"),
        SOMETIMES_WORK_IN_ZIP("No, I sometimes work there"),
        JOB_NOT_FOR_ZIP("This Job isn’t for {zip}"),
        NEVER_DO_SERVICE("Yes, I never do {serviceName}"),
        SOMETIMES_DO_SERVICE("No, I sometimes do {serviceName}"),
        JOB_NOT_FOR_SERVICE("This Job isn’t for {serviceName}"),
        JOB_TOO_SMALL("Job is too small"),
        NOT_EQUIPPED("I’m not equipped, licensed or able to do the job"),
        NOT_READY_TO_HIRE("Customer not ready to hire"),
        //        HIRED_ELSE ("Customer hired someone else"),
        DECLINED("Customer declined my request"),
        NOT_SCHEDULED("We could't schedule"),
        NOT_AGREED_PRICE("We could't agree on price"),
        DUPLICATE("Duplicate request"),
        NOTHING_TO_DO("No work requested or solicitation"),
        NO_RESPOND("Customer didn't respond"),
        NOT_ENOUGH_INFO("Not enough info provided"),
        BAD_CONTACT_INFO("Bad contact info"),
        CLOSED("Customer closed the project"),
        OTHER("Other");

        private final String value;

        Option(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public boolean equalsValue(String value) {
            return this.value.equals(value);
        }


        @Override
        public String toString() {
            return this.value;
        }
    }


}
