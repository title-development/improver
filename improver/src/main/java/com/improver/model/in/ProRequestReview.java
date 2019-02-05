package com.improver.model.in;

import lombok.Data;

import javax.validation.constraints.Size;
import java.util.List;

import static com.improver.util.ErrorMessages.REQUEST_REVIEW_MESSAGE_SIZE_ERROR_MESSAGE;
import static com.improver.util.ErrorMessages.REQUEST_REVIEW_SUBJECT_SIZE_ERROR_MESSAGE;
import static com.improver.util.database.DataAccessUtil.*;

@Data
public class ProRequestReview {
    List<String> emails;
    @Size(min = REVIEW_REQUEST_SUBJECT_MIN_SIZE, max = REVIEW_REQUEST_SUBJECT_MAX_SIZE,
        message = REQUEST_REVIEW_SUBJECT_SIZE_ERROR_MESSAGE)
    String subject;
    @Size(min = REVIEW_REQUEST_MESSAGE_MIN_SIZE, max = REVIEW_REQUEST_MESSAGE_MAX_SIZE,
        message = REQUEST_REVIEW_MESSAGE_SIZE_ERROR_MESSAGE)
    String message;
}
