package com.improver.model.out.project;

import com.improver.model.out.ValidatedLocation;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class OrderValidationResult {

    private Long projectId;
    private ValidatedLocation validatedLocation;


    public static OrderValidationResult valid(long projectId, boolean canUseManual) {
        return new OrderValidationResult().setProjectId(projectId)
            .setValidatedLocation(new ValidatedLocation(true, null, null, null, canUseManual));
    }
}
