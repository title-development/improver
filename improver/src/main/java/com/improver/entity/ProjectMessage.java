package com.improver.entity;


import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.util.serializer.SerializationUtil;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;


import javax.persistence.*;
import javax.validation.constraints.Size;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Accessors(chain = true)
@Entity(name = "project_messages")
@NoArgsConstructor
@EqualsAndHashCode(exclude = {"projectRequest"})
public class ProjectMessage {

    public static final String SENDER_SYSTEM = "system";

    @Id
    @GeneratedValue
    private UUID id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name="project_request_id",  foreignKey = @ForeignKey(name = "messages_project_request_fkey"))
    private ProjectRequest projectRequest;

    @Column(columnDefinition = "varchar(1500)")
    @Size(max = 1500)
    private String body;

    private boolean isRead = false;

    private String sender;

    @JsonFormat(pattern = SerializationUtil.DATE_TIME_PATTERN)
    private ZonedDateTime created = ZonedDateTime.now();

    @Enumerated(EnumType.STRING)
    private Type type = Type.TEXT;

    @Enumerated(EnumType.STRING)
    private Event event;


    public String getId(){
        return this.id == null ? null : this.id.toString();
    }

    public ProjectMessage(ProjectRequest projectRequest, String sender, ZonedDateTime created, Type type, Event event) {
        this.projectRequest = projectRequest;
        this.sender = sender;
        this.created = created;
        this.type = type;
        this.event = event;
        //System messages should be always read
        this.isRead = SENDER_SYSTEM.equalsIgnoreCase(sender);
    }

    public static ProjectMessage plain(long sender, String text, ProjectRequest projectRequest) {
        return new ProjectMessage().setSender(String.valueOf(sender)).setBody(text).setProjectRequest(projectRequest).setCreated(ZonedDateTime.now());
    }

    public static ProjectMessage call(ProjectRequest projectRequest, ZonedDateTime start, String duration) {
        return new ProjectMessage().setProjectRequest(projectRequest).setCreated(start).setBody(duration).setSender(SENDER_SYSTEM).setType(Type.EVENT).setEvent(Event.CALL);
    }

    public static ProjectMessage hire(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.HIRE);
    }

    public static ProjectMessage hireOther(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time,Type.EVENT, Event.HIRE_OTHER);
    }

    public static ProjectMessage close(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.CUSTOMER_CLOSE);
    }

    public static ProjectMessage completedPro(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.PRO_COMPLETE);
    }

    public static ProjectMessage cancel(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.CANCEL);
    }

    public static ProjectMessage leave(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.LEAVE);
    }

    public static ProjectMessage proClose(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.PRO_CLOSE);
    }

    public static ProjectMessage decline(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.DECLINE);
    }

    public static ProjectMessage request(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.REQUEST);
    }

    public static ProjectMessage refundRequest(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.REFUND_REQUEST);
    }

    public static ProjectMessage refundApproved(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.REFUND_APPROVED);
    }

    public static ProjectMessage refundRejected(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.REFUND_REJECTED);
    }

    @Deprecated
    public static ProjectMessage invalidate(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.INVALIDATED);
    }

    public static ProjectMessage autoClose(ProjectRequest projectRequest, ZonedDateTime time) {
        return new ProjectMessage(projectRequest, SENDER_SYSTEM, time, Type.EVENT, Event.AUTO_CLOSE);
    }


    /**
     * User role enum
     */
    public enum Type {
        TEXT ("TEXT"),
        IMAGE ("IMAGE"),
        DOCUMENT ("DOCUMENT"),
        FILE ("FILE"),
        EVENT("EVENT");

        private final String value;

        Type(String type) {
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

    public enum Event {
        CALL("CALL"),
        READ("READ"),
        IS_TYPING("IS_TYPING"),
        REQUEST ("REQUEST"),
        AUTO_CLOSE ("AUTO_CLOSE"),
        //=== Customer ===
        HIRE ("HIRE"),
        DECLINE ("DECLINE"),
        CUSTOMER_CLOSE("CUSTOMER_CLOSE"),
        CANCEL ("CANCEL"),
        HIRE_OTHER ("HIRE_OTHER"),
        PRO_COMPLETE("PRO_COMPLETE"),
        //==== PRO ====
        PRO_CLOSE("PRO_CLOSE"),
        LEAVE ("LEAVE"),
        REFUND_REQUEST ("REFUND_REQUEST"),
        REFUND_APPROVED ("REFUND_APPROVED"),
        REFUND_REJECTED("REFUND_REJECTED"),
        INVALIDATED("INVALIDATED");

        private final String value;

        Event(String type) {
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
