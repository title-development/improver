package com.improver.model.in;

import com.improver.entity.Project;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;

@Data
@Accessors(chain = true)
public class CloseProjectRequest {

    @NotNull private Action action;
    @NotNull private Project.Reason reason;
    private long projectRequestId;
    private String comment;



    public enum Action{
        CANCEL, COMPLETE
    }
}
