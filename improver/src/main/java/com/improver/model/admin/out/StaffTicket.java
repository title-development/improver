package com.improver.model.admin.out;
import com.improver.entity.Ticket;
import com.improver.entity.User;
import com.improver.util.enums.Priority;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.TICKET_MESSAGE_SIZE;

@Data
@NoArgsConstructor
@Accessors(chain = true)
public class StaffTicket {

    private long id;
    private ZonedDateTime created;
    private ZonedDateTime updated;
    private String name;
    private String email;
    private String businessName;
    @Size(max = TICKET_MESSAGE_SIZE)
    private String description;
    @NotNull
    private Ticket.Subject subject;
    private Ticket.Status status;
    @NotNull
    private Priority priority;
    private Long assigneeId;
    private String assigneeEmail;
    private String assigneeName;
    private String authorEmail;
    private User.Role authorRole;

    public StaffTicket(Ticket ticket, Long assigneeId, String assigneeEmail, String assigneeName, String authorEmail, User.Role authorRole) {
        this.id = ticket.getId();
        this.created = ticket.getCreated();
        this.updated = ticket.getUpdated();
        this.name = ticket.getName();
        this.email = ticket.getEmail();
        this.businessName = ticket.getBusinessName();
        this.description = ticket.getDescription();
        this.subject = ticket.getSubject();
        this.status = ticket.getStatus();
        this.priority = ticket.getPriority();
        this.assigneeId = assigneeId;
        this.assigneeEmail = assigneeEmail;
        this.assigneeName = assigneeName;
        this.authorEmail = authorEmail;
        this.authorRole = authorRole;
    }
}
