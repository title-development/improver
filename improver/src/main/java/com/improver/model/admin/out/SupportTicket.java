package com.improver.model.admin.out;
import com.improver.entity.Ticket;
import com.improver.enums.Priority;
import lombok.Data;
import lombok.experimental.Accessors;
import javax.validation.constraints.Size;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.TICKET_MESSAGE_SIZE;

@Data
@Accessors(chain = true)
public class SupportTicket {

    private long id;
    private ZonedDateTime created;
    private ZonedDateTime updated;
    private String name;
    private String email;
    private String businessName;
    @Size(max = TICKET_MESSAGE_SIZE)
    private String description;
    private Ticket.Option option;
    private Ticket.Status status;
    private Priority priority;
    private String assignee;

    public SupportTicket(Ticket ticket, String assigneeEmail, String assigneeDisplayName) {
        this.id = ticket.getId();
        this.created = ticket.getCreated();
        this.updated = ticket.getUpdated();
        this.name = ticket.getName();
        this.email = ticket.getEmail();
        this.businessName = ticket.getBusinessName();
        this.description = ticket.getDescription();
        this.option = ticket.getOption();
        this.status = ticket.getStatus();
        this.priority = ticket.getPriority();
        if (assigneeEmail != null) {
            this.assignee = assigneeEmail + " <" + assigneeDisplayName + ">";
        }
    }
}
