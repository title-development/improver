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
        WRONG_ZIP("I don’t provide services in {zip}"),
        WRONG_SERVICE("I don’t provide {serviceName}"),
        WONT_DO("I won't do this particular job"),
        NOT_AGREED("I talked to client, but we aren't doing the job"),
        UNREACHABLE("Client could not be reached"),
        INVALID_LEAD("Invalid lead");

        private final String value;

        //        move ot Refund and make not static
        private static Map<Issue, List<Option>> options = new LinkedHashMap<>();

        static {
            options.put(WRONG_ZIP, Arrays.asList(
                NEVER_WORK_IN_ZIP,
                SOMETIMES_WORK_IN_ZIP)
            );
            options.put(WRONG_SERVICE, Arrays.asList(
                NEVER_DO_SERVICE,
                SOMETIMES_DO_SERVICE)
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
                OTHER)
            );
            options.put(UNREACHABLE, Arrays.asList(
                BAD_CONTACT_INFO,
                NO_RESPOND,
                DECLINED,
                CLOSED,
                OTHER)
            );
            options.put(INVALID_LEAD, Arrays.asList(
                JOB_NOT_FOR_ZIP,
                JOB_NOT_FOR_SERVICE,
                DUPLICATE,
                NOT_ENOUGH_INFO,
                BAD_CONTACT_INFO,
                NOTHING_TO_DO,
                NOT_READY_TO_HIRE)
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
                case WRONG_ZIP:  return "Do you wish to remove {zip} from your service area?";
                case WRONG_SERVICE:  return "Do you wish to remove {serviceName} from your services?";
                case WONT_DO:  return "Why not?";
                case NOT_AGREED:  return "Why not?";
                case UNREACHABLE:  return "What is the issue?";
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
        NEVER_WORK_IN_ZIP("Yes, I never work in {zip} and dont want to receive leads from there"),
        SOMETIMES_WORK_IN_ZIP("No, I sometimes provide services in {zip}"),
        JOB_NOT_FOR_ZIP("Job isn’t for {zip}"),
        NEVER_DO_SERVICE("Yes, I never do {serviceName} and dont want to receive leads for last"),
        SOMETIMES_DO_SERVICE("No, I sometimes do {serviceName}"),
        JOB_NOT_FOR_SERVICE("This job isn’t for {serviceName}"),
        JOB_TOO_SMALL("Project is too small for me"),
        NOT_EQUIPPED("I don't have the equipment, license(s) or capability"),
        NOT_READY_TO_HIRE("Client not ready to hire"),
        //        HIRED_ELSE ("Customer hired someone else"),
        DECLINED("Client declined my request"),
        NOT_SCHEDULED("Dispute on schedule and/or timeframe for job"),
        NOT_AGREED_PRICE("Dispute on price"),
        DUPLICATE("Job request is a duplicate"),
        NOTHING_TO_DO("No work was requested "),
        NO_RESPOND("No response from the client"),
        NOT_ENOUGH_INFO("Not enough project information"),
        BAD_CONTACT_INFO("Invalid contact information"),
        CLOSED("Client closed the project"),
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
