package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import javax.validation.constraints.Size;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.PROJECT_ACTION_COMMENT_MAX_SIZE;
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

    @Column(columnDefinition = "varchar(" + PROJECT_ACTION_COMMENT_MAX_SIZE + ")")
    private String text;

    @Enumerated(value = EnumType.STRING)
    private Action action;

    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "actions_project_fkey"))
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
        VALIDATE("VALIDATE"),
        INVALIDATE("INVALIDATE"),
        TO_VALIDATION("TO_VALIDATION");

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
