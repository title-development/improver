package com.improver.model.in;

import lombok.Data;

import jakarta.validation.constraints.Size;
import java.util.List;

import static com.improver.util.ErrorMessages.REQUEST_REVIEW_MESSAGE_SIZE_ERROR_MESSAGE;
import static com.improver.util.ErrorMessages.REQUEST_REVIEW_SUBJECT_SIZE_ERROR_MESSAGE;
import static com.improver.util.database.DataRestrictions.*;

@Data
public class ProRequestReview {

    private List<String> emails;

    @Size(message = REQUEST_REVIEW_SUBJECT_SIZE_ERROR_MESSAGE, min = REVIEW_REQUEST_SUBJECT_MIN_SIZE, max = REVIEW_REQUEST_SUBJECT_MAX_SIZE)
    private String subject;

    @Size(message = REQUEST_REVIEW_MESSAGE_SIZE_ERROR_MESSAGE, min = REVIEW_REQUEST_MESSAGE_MIN_SIZE, max = REVIEW_REQUEST_MESSAGE_MAX_SIZE)
    private String message;
}
