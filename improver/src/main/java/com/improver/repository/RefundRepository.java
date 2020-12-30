package com.improver.repository;

import com.improver.entity.Refund;
import com.improver.model.admin.out.AdminRefund;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;
import java.util.Optional;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    @Query("SELECT new com.improver.model.admin.out.AdminRefund(ref, con.id, proj.id, proj.customer.email, con.contractor.email) " +
        "FROM com.improver.entity.Refund ref " +
        "INNER JOIN com.improver.entity.ProjectRequest con ON con.id = ref.projectRequest.id " +
        "LEFT JOIN com.improver.entity.Project proj ON proj.id = con.project.id " +
        "WHERE (:id IS null OR ref.id = :id) " +
        "AND (:contractorEmail IS null OR LOWER(con.contractor.email) LIKE CONCAT('%', LOWER(cast(:contractorEmail as string)), '%')) " +
        "AND (:customerEmail IS null OR LOWER(proj.customer.email) LIKE CONCAT('%', LOWER(cast(:customerEmail as string)), '%')) " +
        "AND (:issue IS null OR ref.issue = :issue) " +
        "AND (:option IS null OR ref.option = :option) " +
        "AND (:status IS null OR ref.status = :status) " +
        "AND ((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR ref.created BETWEEN :createdFrom AND :createdTo) " +
        "AND ((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR ref.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<AdminRefund> getAll(Long id, String contractorEmail, String customerEmail, Refund.Issue issue, Refund.Option option,
                             Refund.Status status, ZonedDateTime createdFrom, ZonedDateTime createdTo,
                             ZonedDateTime updatedFrom, ZonedDateTime updatedTo, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.out.AdminRefund(ref, con.id, proj.id, con.contractor.email, proj.customer.email) " +
        "FROM com.improver.entity.Refund ref " +
        "INNER JOIN com.improver.entity.ProjectRequest con ON con.id = ref.projectRequest.id " +
        "LEFT JOIN com.improver.entity.Project proj ON proj.id = con.project.id " +
        "WHERE ref.id = :id")
    Optional<AdminRefund> findOne(long id);

}
