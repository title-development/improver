package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.Customer;
import com.improver.entity.Review;
import com.improver.model.out.review.CompanyReview;
import com.improver.model.out.review.CompanyReviewRevision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.time.ZonedDateTime;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {


    @Query("SELECT r FROM com.improver.entity.Review r" +
        " WHERE r.isPublished = false AND r.publishDate < ?1")
    List<Review> getForPublishing(ZonedDateTime now);

    // Fix Pageable and count issue
    @Query("SELECT new com.improver.model.out.review.CompanyReview(r, 0)" +
        " FROM com.improver.entity.Review r WHERE r.company.id = ?1 AND (?2 in (SELECT id FROM com.improver.entity.Contractor contr WHERE contr.company.id = r.company.id) OR r.customer.id = ?2 OR r.isPublished = true)")
    Page<CompanyReview> getVisibleReviews(long companyId, long requesterId, ZonedDateTime now, Pageable pageable);

    @Query("SELECT new com.improver.model.out.review.CompanyReview(r, c) " +
        "FROM com.improver.entity.Review r " +
        "INNER JOIN com.improver.entity.Company c ON c.id = r.company.id " +
        "WHERE (:id IS null OR r.id = :id) " +
        "AND (:customerName IS null OR LOWER(r.customer.displayName) LIKE CONCAT('%', LOWER(cast(:customerName as string)), '%')) " +
        "AND (:companyName IS null OR LOWER(c.name) LIKE CONCAT('%', LOWER(cast(:companyName as string)), '%'))" +
        "AND (:scoreFrom IS null OR r.score BETWEEN :scoreFrom AND :scoreTo)")
    Page<CompanyReview> findAllBy(Long id, String customerName, String companyName, Integer scoreFrom, Integer scoreTo, Pageable pageable);

    @Query("SELECT new com.improver.model.out.review.CompanyReviewRevision(r, r.company, st.name, rr.comment)" +
        " FROM com.improver.entity.Review r" +
        " INNER JOIN com.improver.entity.ProjectRequest pr ON pr.review.id = r.id" +
        " INNER JOIN com.improver.entity.ReviewRevisionRequest rr ON rr.review.id = r.id" +
        " INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id" +
        " INNER JOIN com.improver.entity.ServiceType st ON st.id = p.serviceType.id" +
        " WHERE r.id = :reviewId" +
        " AND r.customer = :customer")
    Optional<CompanyReviewRevision> findByCustomerAndId(Customer customer, long reviewId);

    Optional<Review> findByIdAndCompany(Long id, Company company);
}
