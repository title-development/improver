package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.STAFF_ACTION_DESCRIPTION_MAX_SIZE;
import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;


@Entity(name = "staff_actions")
@Data
@NoArgsConstructor
@Accessors(chain = true)
public class StaffAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="staff_id", foreignKey = @ForeignKey(name = "staff_actions_staff_fkey"))
    private Staff author;

    @Column(columnDefinition = "varchar(" + STAFF_ACTION_DESCRIPTION_MAX_SIZE + ")")
    private String description;

    @Enumerated(value = EnumType.STRING)
    private Action action;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created = ZonedDateTime.now();

    public StaffAction(Action action, Staff author, String description) {
        this.author = author;
        this.description = description;
        this.action = action;
    }

    public enum Action {
        ADD_BONUS("ADD_BONUS"),
        CREATE_INVITATION("CREATE_INVITATION"),
        REMOVE_INVITATION("REMOVE_INVITATION"),
        CHANGE_LEAD_PRICE("CHANGE_LEAD_PRICE"),
        CREATE_SERVICE_TYPE("CREATE_SERVICE_TYPE"),
        REMOVE_SERVICE_TYPE("REMOVE_SERVICE_TYPE"),
        ACCOUNT_UPDATE("ACCOUNT_UPDATE"),
        ACCOUNT_DELETE("ACCOUNT_DELETE");

        private final String value;

        Action(String value) {
            this.value = value;
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
