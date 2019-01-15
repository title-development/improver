package com.improver.model.admin.in;

import com.improver.entity.Project;
import lombok.Data;

@Data
public class ValidationProjectRequest {

    private Project.Status resolution;
    private Project.Reason reason;
    private String comment;

}
