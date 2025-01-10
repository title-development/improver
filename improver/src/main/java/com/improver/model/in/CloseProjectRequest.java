package com.improver.model.in;

import com.improver.entity.Project;
import lombok.Data;
import lombok.experimental.Accessors;

import jakarta.validation.constraints.NotNull;

@Data
@Accessors(chain = true)
public class CloseProjectRequest {

    @NotNull private Action action;
    @NotNull private Project.Reason reason;
    private long projectRequestId;
    private String comment;

    public CloseProjectRequest(@NotNull Action action, @NotNull Project.Reason reason, String comment) {
        this.action = action;
        this.reason = reason;
        this.comment = comment;
    }

    public enum Action{
        CANCEL, COMPLETE, INVALIDATE
    }
}
