package com.improver.model.in;

import lombok.Data;

import jakarta.validation.constraints.Size;

import static com.improver.util.ErrorMessages.CUSTOMER_REVIEW_SIZE_ERROR_MESSAGE;
import static com.improver.util.database.DataRestrictions.REVIEW_MESSAGE_MAX_SIZE;
import static com.improver.util.database.DataRestrictions.REVIEW_MESSAGE_MIN_SIZE;

@Data
public class CustomerReview {

    private int score;
    @Size(min = REVIEW_MESSAGE_MIN_SIZE, max = REVIEW_MESSAGE_MAX_SIZE, message = CUSTOMER_REVIEW_SIZE_ERROR_MESSAGE)
    private String description;
}
