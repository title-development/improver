package com.improver.model.out.review;

import com.improver.model.out.project.CompanyProjectRequest;
import lombok.Data;

import java.util.List;

@Data
public class CompanyReviewCapability {

    private List<CompanyProjectRequest> notReviewedProjectRequests;
    private boolean canLeftReview;
}
