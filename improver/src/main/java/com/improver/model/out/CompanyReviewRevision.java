package com.improver.model.out;

import com.improver.entity.Company;
import com.improver.entity.Review;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CompanyReviewRevision extends CompanyReview {
    String serviceName;
    String revisionComment;

    public CompanyReviewRevision(Review review, Company company, String serviceName, String revisionComment) {
        super(review, company);
        this.serviceName = serviceName;
        this.revisionComment = revisionComment;
    }
}
