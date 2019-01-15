package com.improver.model.in;

import lombok.Data;

import javax.validation.constraints.Size;
import java.util.List;

import static com.improver.util.database.DataAccessUtil.*;

@Data
public class ProRequestReview {
    List<String> emails;
    @Size(min = REVIEW_REQUEST_SUBJECT_MIN_SIZE, max = REVIEW_REQUEST_SUBJECT_MAX_SIZE,
        message = "Subject should be " + REVIEW_REQUEST_SUBJECT_MIN_SIZE + " to " + REVIEW_REQUEST_SUBJECT_MAX_SIZE + " characters long.")
    String subject;
    @Size(min = REVIEW_REQUEST_MESSAGE_MIN_SIZE, max = REVIEW_REQUEST_MESSAGE_MAX_SIZE,
        message = "Message should be " + REVIEW_REQUEST_MESSAGE_MIN_SIZE + " to " + REVIEW_REQUEST_MESSAGE_MAX_SIZE + " characters long.")
    String message;
}
