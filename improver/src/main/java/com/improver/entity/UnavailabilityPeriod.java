package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.experimental.Accessors;

import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDate;

import static com.improver.util.serializer.SerializationUtil.DATE_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "unavailability_periods")
@NoArgsConstructor
public class UnavailabilityPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "unavailability_period_company_fkey"))
    private Company company;

    @NonNull
    @JsonFormat(pattern = DATE_PATTERN)
    private LocalDate fromDate;

    @NonNull
    @JsonFormat(pattern = DATE_PATTERN)
    private LocalDate tillDate;

    @NonNull
    private Reason reason;

    public enum Reason {
        TOO_BUSY("Too busy"),
        OUT_OF_TOWN ("Out of town"),
        VACATION ("Vacation"),
        DAY_OFF ("Day off"),
        HOLIDAY ("Holiday"),
        SICKNESS ("Sickness"),
        NOT_ACCEPTING_PROJECTS ("Not accepting projects"),
        OTHER ("Other");

        private final String value;

        Reason(String type) {
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

}
