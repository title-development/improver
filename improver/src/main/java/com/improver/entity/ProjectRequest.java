package com.improver.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Data
@Accessors(chain = true)
@Entity(name = "project_requests")
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="project_id",  foreignKey = @ForeignKey(name = "project_request_project_fkey"))
    private Project project;

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="contractor_id",  foreignKey = @ForeignKey(name = "project_request_contractor_fkey"))
    private Contractor contractor;

    @OneToMany(mappedBy = "projectRequest")
    private List<ProjectMessage> projectMessages;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @Enumerated(EnumType.STRING)
    private Reason reason;

    private String reasonComment;

    private ZonedDateTime created = ZonedDateTime.now();

    private ZonedDateTime updated = ZonedDateTime.now();

    private boolean isManual;

    @OneToOne
    @JoinColumn(name = "refund_id", foreignKey = @ForeignKey(name = "project_request_refund_fkey"))
    private Refund refund;

    @OneToMany(mappedBy = "projectRequest")
    private List<Transaction> transactions;

    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "review_id", foreignKey = @ForeignKey(name = "project_request_review_fkey"))
    private Review review;


    public boolean isRefundable(){
        return status.equals(Status.ACTIVE) ||
                status.equals(Status.HIRED) ||
                status.equals(Status.DECLINED) ||
                status.equals(Status.INACTIVE);
    }

    public boolean isConversationActive(){
        return Status.ACTIVE.equals(status) || Status.HIRED.equals(status);
    }


    public Map<Reason, String> getDeclineVariants(){
        Map<Reason, String> variants = new LinkedHashMap<>();
        variants.put(Reason.TOO_EXPENSIVE, Reason.TOO_EXPENSIVE.getPhrase());
        variants.put(Reason.NOT_RELIABLE, Reason.NOT_RELIABLE.getPhrase());
        variants.put(Reason.NOT_QUALIFIED, Reason.NOT_QUALIFIED.getPhrase());
        variants.put(Reason.COULD_NOT_SCHEDULE, Reason.COULD_NOT_SCHEDULE.getPhrase());
        variants.put(Reason.DID_NOT_SHOW_UP, Reason.DID_NOT_SHOW_UP.getPhrase());
        variants.put(Reason.RUDE, Reason.RUDE.getPhrase());
        variants.put(Reason.HIRE_OTHER, Reason.HIRE_OTHER.getPhrase());
        variants.put(Reason.OTHER, Reason.OTHER.getPhrase());
        return variants;
    }


    public enum Status {
        // ACTIVE TAB
        ACTIVE ("ACTIVE"),                      // Active
        HIRED("HIRED"),                         // Hired but project still in progress
        DECLINED("DECLINED"),                   // Contractor declined by Customer
        INACTIVE("INACTIVE"),                   // Project was canceled or closed by Customer
        REFUND_REQUESTED("REFUND_REQUESTED"),   // In process of refund
        // PREVIOUS TAB
        COMPLETED("COMPLETED"),                 // Completed the project
        REFUNDED("REFUNDED"),                   // Refund approved
        REFUND_REJECTED("REFUND_REJECTED"),     // Refund rejected
        CLOSED("CLOSED"),                       // Contractor left project by himself
        AUTO_CLOSED("AUTO_CLOSED");             // Closed automatically after 7 days of inactivity

        private final String value;

        Status (String status) {
            value = status;
        }

        public boolean equalsValue(String state) {
            return value.equals(state);
        }

        @Override
        public String toString() {
            return this.value;
        }

        public static List<Status> getActiveForCustomer() {
            return Arrays.asList(ACTIVE, HIRED);
        }

        public static List<Status> getActive() {
            return Arrays.asList(ACTIVE, HIRED, DECLINED, INACTIVE, REFUND_REQUESTED);
        }

        public static List<Status> getArchived() {
            return Arrays.asList(COMPLETED, CLOSED, REFUNDED, REFUND_REJECTED, AUTO_CLOSED);
        }
    }

    /**
     *  Resolution
     */
    public enum Reason {
        DONE ("Done by Pro"),
        TOO_EXPENSIVE ("They are too expensive"),
        NOT_RELIABLE ("They are not reliable"),
        NOT_QUALIFIED ("They are not qualified to do the project"),
        COULD_NOT_SCHEDULE ("We couldn't schedule"),
        DID_NOT_SHOW_UP ("They didn't show up for appointment"),
        RUDE ("They were rude or inappropriate"),
        HIRE_OTHER ("I hired someone else"),
        OTHER ("Other, please specify");

        private final String reasonPhrase;

        Reason (String reasonPhrase) {
            this.reasonPhrase = reasonPhrase;
        }

        public String getPhrase() {
            return this.reasonPhrase;
        }

        @Override
        public String toString() {
            return this.reasonPhrase;
        }

    }
}
