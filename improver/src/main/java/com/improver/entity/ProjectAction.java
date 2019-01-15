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


@Entity(name = "project_actions")
@Data
@Accessors(chain = true)
public class ProjectAction {

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
    @JoinColumn(name = "project_id",  foreignKey = @ForeignKey(name = "actions_project_fkey"))
    private Project project;


    public static ProjectAction systemComment(String text) {
        return new ProjectAction().setAuthor(SYSTEM).setText(text).setCreated(ZonedDateTime.now()).setAction(Action.COMMENT);
    }

    public static ProjectAction updateLocation(Location location, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText(location.asText())
            .setCreated(ZonedDateTime.now())
            .setAction(Action.UPDATE_LOCATION);
    }

    public static ProjectAction invalidateProject(Project.Reason reason, String text, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText(reason.getPhrase() + " " + text)
            .setCreated(ZonedDateTime.now())
            .setAction(Action.INVALIDATE);
    }

    public static ProjectAction validateProject(String content, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText(content)
            .setCreated(ZonedDateTime.now())
            .setAction(Action.VALIDATE);
    }

    public static ProjectAction toValidationProject(Project.Reason reason, String text, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText("Reason: " + reason.getPhrase() + ". " + text)
            .setCreated(ZonedDateTime.now())
            .setAction(Action.TO_VALIDATION);
    }

    public static ProjectAction changeOwner(String content, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText(content)
            .setCreated(ZonedDateTime.now())
            .setAction(Action.CHANGE_OWNER);
    }

    public static ProjectAction commentProject(String content, User author) {
        return new ProjectAction().setAuthor(author.getEmail())
            .setText(content)
            .setCreated(ZonedDateTime.now())
            .setAction(Action.COMMENT);
    }

    public enum Action {
        COMMENT("COMMENT"),
        UPDATE_LOCATION("UPDATE_LOCATION"),
        CHANGE_OWNER("CHANGE_OWNER"),
        VALIDATE ("VALIDATE"),
        INVALIDATE ("INVALIDATE"),
        TO_VALIDATION("TO_VALIDATION");

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
