package com.improver.entity;

import com.improver.util.enums.Priority;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import javax.persistence.*;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static com.improver.util.database.DataAccessUtil.TICKET_MESSAGE_SIZE;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@Entity(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private ZonedDateTime created = ZonedDateTime.now();
    private ZonedDateTime updated = created;
    private String name;
    private String email;
    private String businessName;
    @Column(length = TICKET_MESSAGE_SIZE)
    private String description;
    @Enumerated(EnumType.STRING)
    private Subject subject;
    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;
    private Priority priority = Priority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="staff_id", foreignKey = @ForeignKey(name = "tickets_staff_fkey"))
    private Staff assignee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", foreignKey = @ForeignKey(name = "tickets_user_fkey"))
    private User author;

    public enum Subject {
        // FOR STAFF ONLY
        ACCOUNT_ISSUE ("ACCOUNT_ISSUE"),

        // For ANONYMOUS ONLY
        LOGIN_ISSUE ("Login issue"),
        // For CONTRACTOR ONLY
        REQUESTING_CREDIT ("Request a credit"),
        PROVIDED_SERVICES ("Adjusting services"),
        COVERAGE_AREA ("Coverage configuration"),
        BILLING ("Billing and Subscription"),
        COMPANY_PROFILE ("Company profile"),
        // FOR ALL
        REMOVE_ACCOUNT ("Remove account"),
        FEEDBACK ("Feedback"),
        PHONE_HELP_REQUEST ("Phone help request"),
        OTHER ("Other");

        private final String value;

        Subject(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public static List<Subject> getForUsers() {
            List<Subject> subjects = new ArrayList<>(Arrays.asList(Subject.values()));
            subjects.remove(ACCOUNT_ISSUE);
            return subjects;
        }

    }

    public enum Status {
        NEW ("NEW"),
        IN_PROGRESS ("IN_PROGRESS"),
        CLOSED ("CLOSED");

        private final String value;

        Status(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return this.value;
        }

        public static List<Ticket.Status> getActive() {
            return Arrays.asList(NEW, IN_PROGRESS);
        }
    }

}
