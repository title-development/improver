package com.improver.repository;

import com.improver.entity.Project;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.model.out.project.CustomerProjectShort;
import com.improver.model.out.project.ShortLead;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
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
    Optional<Project> getLeadNotPurchasedByCompany(long projectId, String companyId);


    /**
     * Returns Leads according to company services and coverage
     *
     * @param zipCodesToInclude - zip codes to include in search
     */
    @Query("SELECT new com.improver.model.out.project.ShortLead(p.id, p.serviceType.name, p.location, p.created, p.leadPrice)" +
        " FROM com.improver.entity.Project p" +
        " WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId)" +
        " OR p.location.zip IN :zipCodesToInclude)")
    Page<ShortLead> getLeadsInZipCodesAndCoverage(String companyId, List<String> zipCodesToInclude, List<Project.Status> statuses, Pageable pageable);


    /**
     * Returns Leads according to company services and coverage
     */
    @Query("SELECT new com.improver.model.out.project.ShortLead(p.id, p.serviceType.name, p.location, p.created, p.leadPrice)" +
        " FROM com.improver.entity.Project p" +
        " WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId))")
    Page<ShortLead> getLeadsInCoverage(String companyId, List<Project.Status> statuses, Pageable pageable);

    /**
     * Returns Leads according to company services and coverage
     */
    @Query("SELECT p FROM com.improver.entity.Project p WHERE p.isLead = true  AND p.status IN :statuses" +
        " AND p.leadPrice <= :maxPrice" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND (p.location.zip IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId))")
    Page<Project> getSuitableLeads(String companyId, List<Project.Status> statuses, int maxPrice, Pageable pageable);

    /**
     * Excludes leads from company coverage
     *
     * @param zipCodesToInclude - zip codes to include in search
     */
    @Deprecated
    @Query("SELECT new com.improver.model.out.project.ShortLead(p.id, p.serviceType.name, p.location, p.created, p.leadPrice)" +
        " FROM com.improver.entity.Project p" +
        " WHERE p.isLead = true" +
        " AND p.id NOT IN (SELECT conn.project.id FROM com.improver.entity.ProjectRequest conn WHERE conn.contractor.id IN (SELECT contr.id FROM com.improver.entity.Contractor contr WHERE contr.company.id = :companyId))" +
        " AND p.serviceType.id IN (SELECT s.id FROM com.improver.entity.ServiceType s INNER JOIN s.companies c WHERE c.id = :companyId)" +
        " AND p.location.zip IN :zipCodesToInclude" +
        " AND p.location.zip NOT IN (SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = :companyId)" +
        " AND p.status IN :statuses")
    Page<ShortLead> getLeadsExcludingCompanyCoverage(String companyId, List<String> zipCodesToInclude, List<Project.Status> statuses, Pageable pageable);

    //TODO remove this
    @Deprecated
    @Transactional
    @Modifying
    @Query("UPDATE com.improver.entity.Project p SET p.isLead = false WHERE p.id = (SELECT c.project.id FROM com.improver.entity.ProjectRequest c WHERE c.id = ?1)")
    void removeLeadByProjectRequest(long projectRequestId);

    boolean existsByServiceTypeId(long id);

    @Query("SELECT p FROM com.improver.entity.Project p WHERE " +
        "(:id IS null OR p.id = :id)" +
        " AND (:customerEmail IS null OR p.customer.email LIKE %:customerEmail%)" +
        " AND (:serviceType IS null OR p.serviceType.name LIKE %:serviceType%)" +
        " AND (:status IS null OR p.status = :status)" +
        " AND (:reason IS null OR p.reason = :reason)" +
        " AND (:location IS null OR (p.location.streetAddress LIKE %:location%)" +
        " OR (p.location.city LIKE %:location% ) " +
        " OR (p.location.state LIKE %:location% ) " +
        " OR (p.location.zip LIKE %:location% ) ) ")
    Page<Project> findBy(Long id, String customerEmail, String serviceType, Project.Status status, Project.Reason reason, String location, Pageable pageRequest);


    @Deprecated
    @Query("SELECT new com.improver.model.out.project.ProjectRequestDetailed(p, p.serviceType.name, p.customer, prjc, prjc.refund.id)" +
        " FROM com.improver.entity.Project p" +
        " INNER JOIN com.improver.entity.ProjectRequest prjc ON p.id = prjc.project.id " +
        " INNER JOIN com.improver.entity.Contractor c ON c.id = prjc.contractor.id " +
        " WHERE c.company.id = ?1")
    Page<ProjectRequestShort> getCompanyProjects(String companyId, Pageable pageable);

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


}
