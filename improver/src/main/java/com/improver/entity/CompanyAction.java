package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.ForeignKey;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@Entity(name = "company_actions")
public class CompanyAction {

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
    @JoinColumn(name = "company_id",  foreignKey = @ForeignKey(name = "actions_company_fkey"))
    private Company company;


    public static CompanyAction systemComment(String text) {
        return new CompanyAction().setAuthor(SYSTEM).setText(text).setCreated(ZonedDateTime.now()).setAction(Action.COMMENT);
    }

    public static CompanyAction updateLocation(Location location, User author) {
        return new CompanyAction().setAuthor(author.getEmail())
            .setText(location.asText())
            .setCreated(ZonedDateTime.now())
            .setAction(Action.UPDATE_INFO);
    }




    public enum Action {
        COMMENT("COMMENT"),
        UPDATE_INFO("UPDATE_INFO"),
        UPDATE_COVERAGE ("UPDATE_COVERAGE"),
        UPDATE_SERVICES ("UPDATE_SERVICES"),
        SUBSCRIBE("SUBSCRIBE");

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
