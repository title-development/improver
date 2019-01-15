package com.improver.model.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Company;
import com.improver.entity.Review;
import com.improver.model.CompanyInfo;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Getter
@NoArgsConstructor
public class CompanyReview {

    private long id;
    private UserModel customer;
    private int score;
    private String description;
    private CompanyInfo company;
    private boolean isPublished;
    private boolean isRevisionRequested;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private ZonedDateTime publishDate;

    public CompanyReview(Review review, Company company) {
        this.id = review.getId();
        this.customer = new UserModel(review.getCustomer().getId(), review.getCustomer().getDisplayName(), review.getCustomer().getIconUrl());
        this.score = review.getScore();
        this.description = review.getDescription();
        this.company = new CompanyInfo(company);
        this.created = review.getCreated();
        this.publishDate = review.getPublishDate();
        this.isRevisionRequested = review.getReviewRevisionRequest() != null;
        this.isPublished = review.isPublished();
    }

    public CompanyReview(Review review) {
        this.id = review.getId();
        this.customer = new UserModel(review.getCustomer().getId(), review.getCustomer().getDisplayName(), review.getCustomer().getIconUrl());
        this.score = review.getScore();
        this.description = review.getDescription();
        this.created = review.getCreated();
        this.publishDate = review.getPublishDate();
        this.isRevisionRequested = review.getReviewRevisionRequest() != null;
        this.isPublished = review.isPublished();
    }
}
