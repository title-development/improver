package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;
import javax.persistence.*;
import java.time.ZonedDateTime;

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
    private Option option;
    @Enumerated(EnumType.STRING)
    private Status status = Status.NEW;

    public enum Option {
        LOGIN_ISSUE ("Login issue"),
        // For CONTRACTOR
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

        Option(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return this.value;
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
    }

}
