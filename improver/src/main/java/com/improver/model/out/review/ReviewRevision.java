package com.improver.model.out.review;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.ReviewRevisionRequest;
import lombok.Getter;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;


@Accessors(chain = true)
@Getter
public class ReviewRevision {

    private long id;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    private long reviewId;
    private String comment;
    private boolean isDeclined;

    public ReviewRevision(ReviewRevisionRequest reviewRevisionRequest, long reviewId) {
        this.id = reviewRevisionRequest.getId();
        this.created = reviewRevisionRequest.getCreated();
        this.reviewId = reviewId;
        this.comment = reviewRevisionRequest.getComment();
        this.isDeclined = reviewRevisionRequest.isDeclined();
    }


}
