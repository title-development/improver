package com.improver.repository;

import com.improver.entity.Contractor;
import com.improver.entity.Customer;
import com.improver.entity.Project;
import com.improver.entity.ProjectRequest;
import com.improver.model.admin.out.AdminProjectRequest;
import com.improver.model.out.project.CompanyProjectRequest;
import com.improver.model.out.project.ProjectRequestDetailed;
import com.improver.model.out.project.ProjectRequestShort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {

    //TODO: For future, Misha refactor this - split in two methods
    @Query("SELECT new com.improver.model.out.project.CompanyProjectRequest(c, c.contractor.company, c.project.status, c.review.id, " +
            "(SELECT COUNT(m.id) FROM com.improver.entity.ProjectMessage m " +
                " INNER JOIN com.improver.entity.ProjectRequest p ON p.id = m.projectRequest.id" +
                " WHERE c.id = m.projectRequest.id " +
                " AND p.status IN ('ACTIVE', 'HIRED')" +
                " AND m.isRead = false " +
                " AND m.sender != ?2)) " +
        " FROM com.improver.entity.ProjectRequest c WHERE c.project.id = ?1 " +
        " ORDER BY c.created ASC")
    List<CompanyProjectRequest> getShortProjectRequestsWithMsgCount(long projectId, String customerId);

    @Query("SELECT new com.improver.model.out.project.CompanyProjectRequest(pr, pr.contractor.company, pr.project.status, pr.review.id) " +
        " FROM com.improver.entity.ProjectRequest pr WHERE pr.project.id = ?1 " +
        " ORDER BY pr.created ASC")
    List<CompanyProjectRequest> getShortProjectRequests(long projectId);

    @Query("SELECT new com.improver.model.out.project.CompanyProjectRequest(pr, pr.contractor.company, pr.project.status, pr.review.id) " +
        " FROM com.improver.entity.ProjectRequest pr WHERE pr.project.id = ?2 AND pr.project.customer = ?1" +
        " ORDER BY pr.created ASC")
    List<CompanyProjectRequest> getProjectRequestsForCustomer(Customer customer, long projectId);

    @Query("SELECT new com.improver.model.out.project.CompanyProjectRequest(c, c.contractor.company, c.contractor, c.project.status, c.review.id, (SELECT COUNT(m.id) FROM com.improver.entity.ProjectMessage m WHERE c.id = m.projectRequest.id AND m.isRead = false AND m.sender != ?2)) " +
        "FROM com.improver.entity.ProjectRequest c WHERE c.id =?1 ")
    Optional<CompanyProjectRequest> getCompanyProjectRequest(long projectRequestId, String customerId);

    @Query("SELECT c FROM com.improver.entity.ProjectRequest c WHERE c.project.id IN (SELECT c.project.id FROM com.improver.entity.ProjectRequest c WHERE c.id = ?1)")
    List<ProjectRequest> findRelatedProjectRequests(long projectRequestId);

    Optional<ProjectRequest> findByIdAndProjectId(long projectRequestId, long projectId);

    @Query("SELECT c FROM com.improver.entity.ProjectRequest c WHERE c.id = ?1 AND c.project.customer.id = ?2")
    Optional<ProjectRequest> findByIdAndCustomerId(long projectRequestId, long customerId);

    @Query("SELECT c FROM com.improver.entity.ProjectRequest c WHERE c.id = ?1 AND c.contractor.id = ?2")
    Optional<ProjectRequest> findByIdAndContractorId(long projectRequestId, long contractorId);

    @Query("SELECT new com.improver.model.admin.out.AdminProjectRequest(con, pro, ref) " +
        "FROM com.improver.entity.ProjectRequest con " +
        "INNER JOIN com.improver.entity.Project pro ON pro.id = con.project.id " +
        "LEFT JOIN com.improver.entity.Refund ref ON ref.id = con.refund.id " +
        "WHERE (:id IS null OR con.id = :id) " +
        "AND (:contractorEmail IS null OR LOWER(con.contractor.email) LIKE CONCAT('%', LOWER(cast(:contractorEmail as string)), '%')) " +
        "AND (:customerEmail IS null OR LOWER(pro.customer.email) LIKE CONCAT('%', LOWER(cast(:customerEmail as string)), '%')) " +
        "AND (:status IS null OR con.status = :status) " +
        "AND (:projectStatus IS null OR pro.status = :projectStatus) ")
    Page<AdminProjectRequest> getAll(Long id, String contractorEmail, String customerEmail, ProjectRequest.Status status, Project.Status projectStatus, Pageable pageable);

    @Query("SELECT  pc FROM com.improver.entity.ProjectRequest pc WHERE pc.contractor.id =?1 ORDER BY pc.created ASC")
    List<ProjectRequest> findByContractorId(long contractorId);

    @Query("SELECT new com.improver.model.out.project.ProjectRequestShort(p, p.serviceType.name, p.customer, pr, pr.refund.id, r.id)" +
        " FROM com.improver.entity.ProjectRequest pr" +
        " INNER JOIN pr.project p ON p.id = pr.project.id" +
        " LEFT JOIN com.improver.entity.Review r ON pr.review.id = r.id " +
        " WHERE pr.contractor.id = :contractorId AND pr.status IN :statuses " +
        " AND (:search IS null OR ( lower(p.customer.displayName) LIKE %:search% OR lower(p.serviceType.name) LIKE %:search% )) ")
    Page<ProjectRequestShort> getForDashboard(long contractorId, List<ProjectRequest.Status> statuses, String search, Pageable pageable);


    @Query("SELECT new com.improver.model.out.project.ProjectRequestDetailed(p, p.serviceType.name, p.customer, pr, pr.refund.id, r.id)" +
        " FROM com.improver.entity.ProjectRequest pr" +
        " INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id" +
        " LEFT JOIN com.improver.entity.Review r ON pr.review.id = r.id " +
        " WHERE pr.id = ?1 AND pr.contractor.id =?2")
    Optional<ProjectRequestDetailed> getDetailedForPro(long projectRequestId, long contractorId);

    List<ProjectRequest> findByContractorAndCreatedBetweenOrderByCreated(Contractor contractor, ZonedDateTime dateFrom, ZonedDateTime dateTo);

    Page<ProjectRequest> findByContractorOrderByCreated(Contractor contractor, Pageable pageable);

    List<ProjectRequest> findByStatusAndProjectId(ProjectRequest.Status status, long projectId);

    List<ProjectRequest> findByStatusInAndProjectId(Iterable<ProjectRequest.Status> statuses, long projectId);

    @Query("SELECT pr FROM com.improver.entity.ProjectRequest pr " +
        "INNER JOIN com.improver.entity.Project p ON pr.project.id = p.id " +
        "INNER JOIN com.improver.entity.Contractor c on pr.contractor.id = c.id " +
        "WHERE pr.review IS NULL " +
        "AND (pr.status = 'HIRED' OR pr.status = 'COMPLETED' ) " +
        "AND p.customer.id = ?1 " +
        "AND c.company.id = ?2")
    List<ProjectRequest> getNotReviewedProjectRequests(Long customerId, String companyId);



    @Query("SELECT pr FROM com.improver.entity.ProjectRequest pr WHERE pr.id = ?1 AND pr.contractor.email = ?2")
    Optional<ProjectRequest> findByIdAndContractorEmail(long projectRequestId, String contractorEmail);

    @Query("SELECT pr FROM com.improver.entity.ProjectRequest pr " +
        "INNER JOIN pr.project p ON p.id = pr.project.id " +
        "WHERE pr.id = ?1 AND p.customer.email = ?2")
    Optional<ProjectRequest> findByIdAndCustomerEmail(long projectRequestId, String customerEmail);
}
