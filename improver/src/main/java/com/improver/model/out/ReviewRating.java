package com.improver.model.out;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;

@Getter
@RequiredArgsConstructor
public class ReviewRating {
    private final double rating;
    private final Page<CompanyReview> reviews;
}
