package com.improver.repository;

import com.improver.entity.ReviewRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ReviewRequestRepository extends JpaRepository<ReviewRequest, Long> {

    Optional<ReviewRequest> findByReviewToken(String uuid);

    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END from com.improver.entity.ProjectRequest pc " +
        "INNER JOIN com.improver.entity.Contractor c on pc.contractor.id = c.id " +
        "INNER JOIN com.improver.entity.Project p on p.id = pc.project.id " +
        "WHERE pc.review IS NULL " +
        "AND (pc.status = 'HIRED' OR pc.status = 'COMPLETED' ) " +
        "AND p.customer.id = ?1 " +
        "AND c.company.id = ?2")
    boolean existsNotReviewedProjectRequests(Long customerId, String companyId);


    @Query("SELECT CASE WHEN COUNT(pc) > 0 THEN true ELSE false END from com.improver.entity.ProjectRequest pc " +
        "INNER JOIN com.improver.entity.Contractor c on pc.contractor.id = c.id " +
        "INNER JOIN com.improver.entity.Project p on p.id = pc.project.id " +
        "WHERE p.customer.id = ?1 " +
        "AND c.company.id = ?2")
    boolean existsProjectRequestByCustomerAndCompany(Long customerId, String companyId);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM com.improver.entity.Review r " +
        "WHERE r.company.id = ?2 " +
        "AND r.customer.id = ?1")
    boolean existsReviewsByUserAndCompany(Long customerId, String companyId);

    @Query("SELECT CASE WHEN COUNT(rr) > 0 THEN true ELSE false END FROM com.improver.entity.ReviewRequest rr " +
        "WHERE rr.companyId = ?2 " +
        "AND rr.customerEmail = ?1 " +
        "AND rr.completed = false")
    boolean existsReviewRequestByCustomerEmailAndCompanyId(String customerEmail, String companyId);

    @Query("SELECT rr FROM com.improver.entity.ReviewRequest rr " +
        "WHERE rr.companyId = ?2 " +
        "AND rr.customerEmail = ?1 " +
        "AND rr.completed = false")
    List<ReviewRequest> getNotCompletedReviewRequests(String customerEmail, String companyId);

    List<ReviewRequest> getAllByCompanyId(String id);

}
