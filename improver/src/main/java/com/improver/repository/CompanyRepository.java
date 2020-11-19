package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.CompanyAction;
import com.improver.entity.ServiceType;
import com.improver.model.CompanyInfo;
import com.improver.model.admin.out.Record;
import com.improver.model.projection.ImageProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;


public interface CompanyRepository extends JpaRepository<Company, Long> {

    @Query("SELECT b.company FROM com.improver.entity.Billing b WHERE b.subscription.active = true AND b.subscription.nextBillingDate < :till")
    List<Company> findSubscriptionCandidates(ZonedDateTime till);

    @Query("SELECT new com.improver.model.CompanyInfo(c)" +
        " FROM com.improver.entity.Company c WHERE c.id = ?1")
    CompanyInfo getCompanyInfo(long companyId);

    @Query("SELECT c from com.improver.entity.CompanyAction c WHERE " +
        "c.company.id = ?1")
    Page<CompanyAction> getCompanyLogs(long companyId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.Company c SET c.location.streetAddress = ?2, c.location.city = ?3,  c.location.state = ?4, c.location.zip = ?5, c.location.lat = ?6, c.location.lng = ?7  WHERE c.id = ?1")
    void updateCompanyLocation(long companyId, String streetAddress, String city, String state, String zip, double lat, double lng);


    @Query("SELECT c FROM com.improver.entity.Company c WHERE " +
        "(:id IS null OR c.id = :id) ")
    Page<Company> getAllBy(Long id, Pageable pageable);

    @Query("SELECT c FROM com.improver.entity.Company c WHERE " +
        "(:id IS null OR c.id = :id) AND " +
        "(:name IS null OR (LOWER(c.name) LIKE CONCAT('%', LOWER(cast(:name as string)), '%'))) " +
        " AND (:location IS null OR (LOWER(c.location.streetAddress) LIKE CONCAT('%', LOWER(cast(:location as string)), '%'))" +
        " OR (LOWER(c.location.city) LIKE CONCAT('%', LOWER(cast(:location as string)), '%')) " +
        " OR (LOWER(c.location.state) LIKE CONCAT('%', LOWER(cast(:location as string)), '%')) " +
        " OR (LOWER(c.location.zip) LIKE CONCAT('%', LOWER(cast(:location as string)), '%'))) ")
    Page<Company> findBy(Long id, String name, String location, Pageable pageable);

    boolean existsByServiceTypesId(long id);

    boolean existsByTradesId(long id);

    @Query("SELECT c FROM com.improver.entity.Company c" +
        " INNER JOIN c.billing b" +
        " INNER JOIN c.areas a" +
        " INNER JOIN c.serviceTypes s" +
        " WHERE b.subscription.active = true AND b.subscription.reserve >= :leadPrice" +
        " AND a.zip IN :zip AND s = :serviceType" +
        " AND NOT EXISTS (SELECT up FROM c.unavailabilityPeriods up WHERE :currentDate BETWEEN up.fromDate AND up.tillDate)")
    List<Company> getEligibleForSubscriptionLead(ServiceType serviceType, String zip, int leadPrice, LocalDate currentDate);

    @Query(value = "SELECT comp.id from contractors contr " +
        " LEFT JOIN (SELECT pr.contractor_id AS contr_id, MAX(pr.created) AS latest FROM project_requests pr WHERE pr.is_manual = false GROUP BY pr.contractor_id) AS leads ON leads.contr_id = contr.id " +
        " INNER JOIN companies comp on contr.company_id = comp.id " +
        " WHERE comp.id IN :eligibleForSubs " +
        " ORDER BY leads.latest ASC NULLS FIRST LIMIT :number", nativeQuery = true)
    List<Long> getLastSubsPurchased(List<Long> eligibleForSubs, int number);

    @Query("SELECT CASE WHEN count(c)> 0 THEN false ELSE true END FROM com.improver.entity.Company c WHERE LOWER(c.name) = LOWER(?1)")
    boolean isNameFree(String name);

    @Query("SELECT c FROM com.improver.entity.Company c INNER JOIN c.contractors contr ON c.id = contr.company.id" +
        " WHERE contr.email = ?1")
    Optional<Company> findByContractorEmail(String contractorEmail);

    @Query(value = "SELECT case when(c.icon_url LIKE '%https://%') then null else i.data end as image, c.icon_url as redirectUrl FROM companies c " +
        "LEFT JOIN images i on c.icon_url LIKE '%https://%' or " +
        "(substring(c.icon_url, length(c.icon_url) - position('/' in reverse(c.icon_url)) + 2, length(c.icon_url)) = i.name) " +
        "WHERE c.id = :companyId LIMIT 1",nativeQuery = true)
    ImageProjection getCompanyIcon(long companyId);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.Company c SET isApproved = ?2 WHERE c.id = ?1")
    void approve(long companyId, boolean approved);

    @Query("SELECT new com.improver.model.admin.out.Record(c.rating, c.name, 'RATING') FROM com.improver.entity.Company c " +
        "WHERE c.created > :period " +
        "ORDER BY c.rating DESC, c.name")
    List<Record> getTopRatedCompanies(ZonedDateTime period, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.out.Record(SUM(t.amount) as amount, c.name, 'PROFIT') FROM com.improver.entity.Transaction t " +
        "LEFT JOIN com.improver.entity.Company c ON c.id = t.company.id " +
        "WHERE t.created > :period " +
        "AND t.chargeId IS NOT NULL " +
        "GROUP BY c.name " +
        "ORDER BY amount")
    List<Record> getProfitableCompanies(ZonedDateTime period, Pageable pageable);
}
