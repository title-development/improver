package com.improver.repository;

import com.improver.entity.ReviewRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRequestRepository extends JpaRepository<ReviewRequest, Long> {

    Optional<ReviewRequest> findByReviewToken(String uuid);

    @Query("SELECT CASE WHEN COUNT(rr) > 0 THEN true ELSE false END FROM com.improver.entity.ReviewRequest rr " +
        "WHERE rr.companyId = ?2 " +
        "AND rr.customerEmail = ?1 " +
        "AND rr.completed = false")
    boolean existsReviewRequestByCustomerEmailAndCompanyId(String customerEmail, long companyId);

    List<ReviewRequest> getAllByCompanyId(long companyId);

}
