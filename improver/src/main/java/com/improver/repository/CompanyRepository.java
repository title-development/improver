package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.CompanyAction;
import com.improver.entity.ServiceType;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.out.Record;
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


public interface CompanyRepository extends JpaRepository<Company, String> {

    @Query("SELECT new com.improver.model.CompanyInfo(c)" +
        " FROM com.improver.entity.Company c WHERE c.id = ?1")
    CompanyInfo getCompanyInfo(String companyId);

    @Query("SELECT c from com.improver.entity.CompanyAction c WHERE " +
        "c.company.id = ?1")
    Page<CompanyAction> getCompaniesLogs(String companyId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.Company c SET c.name = ?2, c.description = ?3, c.email = ?4, c.founded = ?5 WHERE c.id = ?1")
    void updateCompanyInfo(String companyId, String name, String description, String email, int founded);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.Company c SET c.location.streetAddress = ?2, c.location.city = ?3,  c.location.state = ?4, c.location.zip = ?5, c.location.lat = ?6, c.location.lng = ?7  WHERE c.id = ?1")
    void updateCompanyLocation(String companyId, String streetAddress, String city, String state, String zip, double lat, double lng);




    @Query("SELECT c FROM com.improver.entity.Company c WHERE " +
        "(:id IS null OR c.id = :id) ")
    Page<Company> getAllBy(String id, Pageable pageable);

    boolean existsByServiceTypesId(long id);

    boolean existsByTradesId(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(t.id, t.name) FROM com.improver.entity.Trade t" +
        " INNER JOIN t.companies c WHERE c.id = ?1 ORDER BY t.name ASC")
    List<NameIdTuple> getOfferedTrades(String companyId);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.companies c ON c.id = ?1 WHERE s.active = true AND s.id NOT IN ?2")
    List<NameIdTuple> getOther(String companyId, List<Long> serviceIds);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.companies c ON c.id = ?1 WHERE s.active = true")
    List<NameIdTuple> getAll(String companyId);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.Company c " +
        "LEFT JOIN c.serviceTypes s " +
        "WHERE c.id = :companyId")
    Page<NameIdTuple> getCompanyServices(String companyId, Pageable pageable);

    @Query("SELECT new com.improver.model.NameIdParentTuple(s.id, s.name, t.id) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.trades t ON t.id IN ?2" +
        " INNER JOIN s.companies c ON c.id = ?1" +
        " ORDER BY s.name ASC")
    List<NameIdParentTuple> getSelectedByTrades(String companyId, List<Long> tradeIds);

    @Query("SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = ?1")
    List<String> getCompanyAreas(String companyId);

    @Query("SELECT c FROM com.improver.entity.Company c" +
        " INNER JOIN c.billing b" +
        " INNER JOIN c.areas a" +
        " INNER JOIN c.serviceTypes s" +
        " WHERE b.subscription.active = true AND b.subscription.reserve >= :leadPrice" +
        " AND a.zip IN :zip AND s = :serviceType" +
        " AND NOT EXISTS (SELECT up FROM c.unavailabilityPeriods up WHERE :currentDate BETWEEN up.fromDate AND up.tillDate)")
    List<Company> getEligibleForSubscriptionLead(ServiceType serviceType, String zip, int leadPrice, LocalDate currentDate);

    @Query("SELECT CASE WHEN count(c)> 0 THEN false ELSE true END FROM com.improver.entity.Company c WHERE c.email = ?1")
    boolean isEmailFree(String email);

    @Query("SELECT CASE WHEN count(c)> 0 THEN false ELSE true END FROM com.improver.entity.Company c WHERE LOWER(c.name) = LOWER(?1)")
    boolean isNameFree(String name);

    @Query("SELECT c FROM com.improver.entity.Company c INNER JOIN c.contractors contr ON c.id = contr.company.id" +
        " WHERE contr.email = ?1")
    Optional<Company> findByContractorEmail(String contractorEmail);

    @Query("SELECT c.iconUrl FROM com.improver.entity.Company c WHERE c.id = ?1")
    Optional<String> getIconUrl(String companyId);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.Company c SET isApproved = ?2 WHERE c.id = ?1")
    void approve(String companyId, boolean approved);

    @Query("SELECT new com.improver.model.admin.out.Record(c.rating, c.name, 'RATING') FROM com.improver.entity.Company c " +
        "WHERE c.created > :period " +
        "ORDER BY c.rating DESC, c.name")
    List<Record> getTopRatedCompanies(ZonedDateTime period, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.out.Record(SUM(t.amount) as amount, c.name, 'PROFIT') FROM com.improver.entity.Transaction t " +
        "LEFT JOIN com.improver.entity.Company c ON c.id = t.company.id " +
        "WHERE t.created > :period " +
        "AND t.chargeId IS NOT NULL " +
        "GROUP BY amount, c.name " +
        "ORDER BY amount")
    List<Record> getProfitableCompanies(ZonedDateTime period, Pageable pageable);
}
