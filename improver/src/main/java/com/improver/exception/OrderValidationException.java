package com.improver.exception;

import com.improver.model.out.ValidatedLocation;
import com.improver.model.out.project.OrderValidationResult;
import lombok.Getter;

public class OrderValidationException extends RuntimeException {

    @Getter
    private OrderValidationResult validationResult;

    public OrderValidationException(ValidatedLocation validatedLocation) {
        super(validatedLocation.getError());
        this.validationResult = new OrderValidationResult().setValidatedLocation(validatedLocation);
    }

    public OrderValidationException(ValidatedLocation validatedLocation, Long projectId) {
        super(validatedLocation.getError());
        this.validationResult = new OrderValidationResult()
            .setValidatedLocation(validatedLocation)
            .setProjectId(projectId);
    }
}
