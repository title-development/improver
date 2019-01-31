package com.improver.model.in;

import com.improver.enums.Priority;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class SupportTicketUpdate {

    private long id;
    private Priority priority;
    private String assignee;

}
