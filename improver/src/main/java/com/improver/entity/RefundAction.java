package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Entity(name = "refund_actions")
@Data
@Accessors(chain = true)
public class RefundAction {

    public static final String SYSTEM = "system";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String author;

    private String text;

    @Enumerated(value = EnumType.STRING)
    private Action action;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "refund_id",  foreignKey = @ForeignKey(name = "actions_refund_fkey"))
    private Refund refund;

    public enum Action {
        COMMENT("COMMENT"),
        APPROVE("APPROVE"),
        REJECT("REJECT");

        private final String value;

        Action(String action) {
            value = action;
        }

        public boolean equalsValue(String role) {
            return value.equals(role);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }

}
