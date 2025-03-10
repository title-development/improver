package com.improver.repository;

import com.improver.entity.Project;
import com.improver.model.out.project.CustomerProjectShort;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.model.out.project.ShortLead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;


public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT new com.improver.model.out.project.CustomerProjectShort(p.id, p.serviceType.name, p.status, p.created, p.coverUrl)" +
        " FROM com.improver.entity.Project p WHERE p.customer.id = ?1 AND p.status IN ?2")
    Page<CustomerProjectShort> findByCustomerAndStatuses(long customerId, List<Project.Status> statuses, Pageable pageable);


    @Query("SELECT p FROM com.improver.entity.Project p WHERE p.isLead = true AND p.id = :projectId AND p.id NOT IN " +
        "(SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn " +
        "WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))")
    Optional<Project> getLeadNotPurchasedByCompany(long projectId, long companyId);


    /**
     * Returns Leads according to company services and coverage + in bounding-box coordinates
     *
     */
    @Query("SELECT new com.improver.model.out.project.ShortLead(p.id, p.serviceType.name, p.location, p.created, p.leadPrice, p.centroid)" +
        " FROM com.improver.entity.Project p" +
        " WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (:search IS null OR (lower(p.serviceType.name) LIKE %:search% ))" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId)" +
        " OR (p.centroid.lat > :swLat AND p.centroid.lat < :neLat AND p.centroid.lng > :swLng AND p.centroid.lng < :neLng))")
    Page<ShortLead> getLeadsInCoverageAndBbox(long companyId, List<Project.Status> statuses, String search, double neLat, double neLng, double swLat, double swLng, Pageable pageable);

    /**
     * Returns Leads according to company services and coverage
     */
    @Query("SELECT new com.improver.model.out.project.ShortLead(p.id, p.serviceType.name, p.location, p.created, p.leadPrice, p.centroid)" +
        " FROM com.improver.entity.Project p" +
        " WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (:searchTerm IS null OR (lower(p.serviceType.name) LIKE %:searchTerm% ))" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId))")
    Page<ShortLead> getLeadsInCoverage(long companyId, List<Project.Status> statuses, String searchTerm, Pageable pageable);

    /**
     * Returns Leads according to company services and coverage
     */
    @Query("SELECT p FROM com.improver.entity.Project p WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.leadPrice <= :maxPrice" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId))")
    Page<Project> getSuitableLeads(long companyId, List<Project.Status> statuses, int maxPrice, Pageable pageable);



    //TODO remove this
    @Deprecated
    @Transactional
    @Modifying
    @Query("UPDATE com.improver.entity.Project p SET p.isLead = false WHERE p.id = (SELECT c.project.id FROM com.improver.entity.ProjectRequest c WHERE c.id = ?1)")
    void removeLeadByProjectRequest(long projectRequestId);

    boolean existsByServiceTypeId(long id);

    @Query("SELECT p FROM com.improver.entity.Project p WHERE " +
        "(:id IS null OR p.id = :id)" +
        " AND (:customerEmail IS null OR LOWER(p.customer.email) LIKE CONCAT('%', LOWER(cast(:customerEmail as string)), '%'))" +
        " AND (:serviceType IS null OR LOWER(p.serviceType.name) LIKE CONCAT('%', LOWER(cast(:serviceType as string)), '%'))" +
        " AND (:status IS null OR p.status = :status)" +
        " AND (:reason IS null OR p.reason = :reason)" +
        " AND ((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR p.created BETWEEN :createdFrom AND :createdTo)" +
        " AND (:location IS null OR (LOWER(p.location.streetAddress) LIKE CONCAT('%', LOWER(cast(:location as string)), '%'))" +
        " OR (LOWER(p.location.city) LIKE CONCAT('%', LOWER(cast(:location as string)), '%')) " +
        " OR (LOWER(p.location.state) LIKE CONCAT('%', LOWER(cast(:location as string)), '%')) " +
        " OR (LOWER(p.location.zip) LIKE CONCAT('%', LOWER(cast(:location as string)), '%'))) ")
    Page<Project> findBy(Long id, String customerEmail, String serviceType, Project.Status status, Project.Reason reason,
                         String location, ZonedDateTime createdFrom, ZonedDateTime createdTo, Pageable pageRequest);


    @Query("SELECT new com.improver.model.out.project.ProjectRequestDetailed(p, p.serviceType.name, p.customer, pr, pr.refund.id, r.id )" +
        " FROM com.improver.entity.Project p" +
        " INNER JOIN com.improver.entity.ProjectRequest pr ON p.id = pr.project.id " +
        " INNER JOIN com.improver.entity.Contractor c ON c.id = pr.contractor.id " +
        " LEFT JOIN com.improver.entity.Review r ON pr.review.id = r.id " +
        " WHERE c.company.id = ?1")
    Page<ProjectRequestShort> getCompanyProjects(long companyId, Pageable pageable);

    @Query("SELECT p from com.improver.entity.Project p WHERE " +
        "p.id <> ?1 AND " +
        "(p.created BETWEEN ?2 AND ?3) AND p.serviceType.name = ?4 AND p.location.streetAddress = ?5")
    List<Project> findDuplications(long originalId, ZonedDateTime dateFrom, ZonedDateTime dateTo, String serviceType, String streetAddress);

    @Query("SELECT p from com.improver.entity.Project p WHERE " +
        "p.id <> ?1 " +
        "AND (((p.created BETWEEN ?2 AND ?3) AND p.serviceType.name = ?4) " +
        "OR ((p.created BETWEEN ?2 AND ?3) AND street_address = ?5) " +
        "OR (p.serviceType.name = ?4 AND street_address = ?5))"
    )
    List<Project> findDuplicationCandidates(long originalId, ZonedDateTime dateFrom, ZonedDateTime dateTo, String serviceType, String streetAddress);

    Optional<Project> findByIdAndCustomerId(Long id, Long customerId);

    List<Project> findByCustomerIdAndIsLeadAndStatusIn(long customerId, boolean isLead, List<Project.Status> statuses);

    @Query(value = "SELECT zip FROM projects p " +
        "WHERE p.customer_id = :customerId " +
        "ORDER BY p.created DESC LIMIT 1", nativeQuery = true)
    String findLastZipCodeByCustomerId(long customerId);
}
