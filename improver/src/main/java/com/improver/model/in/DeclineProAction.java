package com.improver.model.in;

import com.improver.entity.ProjectRequest;
import lombok.Data;

@Data
public class DeclineProAction {

    private ProjectRequest.Reason reason;
    private String comment;
}
