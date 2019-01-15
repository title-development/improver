package com.improver.model.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.improver.entity.Review;
import com.improver.entity.ReviewRevisionRequest;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
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
