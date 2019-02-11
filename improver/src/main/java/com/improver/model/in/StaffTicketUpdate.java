package com.improver.model.in;

import com.improver.enums.Priority;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class StaffTicketUpdate {

    private long id;
    private Priority priority;
    private String assigneeEmail;

}
