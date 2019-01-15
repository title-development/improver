package com.improver.repository;

import com.improver.entity.ReviewRevisionRequest;
import com.improver.model.out.ReviewRevision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ReviewRevisionRequestRepository extends JpaRepository<ReviewRevisionRequest, Long> {

    @Query("SELECT new com.improver.model.out.ReviewRevision(rev, rev.review.id)" +
        " FROM com.improver.entity.ReviewRevisionRequest rev" +
        " WHERE rev.review.id = :reviewId")
    Optional<ReviewRevision> findByReviewId(long reviewId);

}
