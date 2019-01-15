package com.improver.model.admin.out;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;


@Data
@NoArgsConstructor
@Accessors(chain = true)
public class Record {
    private Double amount;
    private ZonedDateTime created;
    private String type;
    private String name;

    public Record(Number amount, ZonedDateTime created, String type) {
        this.amount = amount == null ? 0d : amount.doubleValue();
        this.created = created;
        this.type = type;
    }

    public Record(Number amount, String name, String type) {
        this.amount = amount == null ? 0d : amount.doubleValue();
        this.name = name;
        this.type = type;
    }

    public enum Period {
        HALF_YEAR("HALF_YEAR"),
        MONTH("MONTH"),
        WEEK("WEEK");

        private final String value;

        Period(String status) {
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
}
