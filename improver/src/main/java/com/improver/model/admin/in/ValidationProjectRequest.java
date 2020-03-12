package com.improver.model.admin.in;

import com.improver.entity.Project;
import lombok.Data;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import static com.improver.util.database.DataRestrictions.ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE;
import static com.improver.util.database.DataRestrictions.ADMIN_PROJECT_VALIDATION_COMMENT_MIN_SIZE;

@Data
public class ValidationProjectRequest {
    @NotNull
    private Project.Status status;
    @NotNull
    private Project.Reason reason;
    @Size(min = ADMIN_PROJECT_VALIDATION_COMMENT_MIN_SIZE, max = ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE, message = "Comment should be be between " + ADMIN_PROJECT_VALIDATION_COMMENT_MIN_SIZE + " and " + ADMIN_PROJECT_VALIDATION_COMMENT_MAX_SIZE + " characters")
    private String comment;

}
