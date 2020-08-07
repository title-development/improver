package com.improver.repository;

import com.improver.entity.ServiceType;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.OfferedService;
import com.improver.model.admin.AdminServiceType;
import com.improver.model.admin.out.Record;
import com.improver.model.out.NameIdImageTuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    ServiceType findByName(String name);

    @Query("SELECT CASE WHEN count(c)> 0 THEN false ELSE true END FROM com.improver.entity.ServiceType c WHERE LOWER(c.name) = LOWER(?1)")
    boolean isServiceNameFree(String name);

    List<ServiceType> findByNameContaining(String namePart);

    List<ServiceType> findByNameIn(List<String> names);

    List<ServiceType> findByIdIn(List<Long> ids);

    @Query("SELECT new com.improver.model.admin.AdminServiceType(s, q.id) " +
        "FROM com.improver.entity.ServiceType s " +
        "LEFT JOIN s.questionary q ON q.id = s.questionary.id " +
        "WHERE (:id IS null OR s.id = :id) AND " +
        "(:name IS null OR LOWER(s.name) LIKE CONCAT('%', LOWER(cast(:name as string)), '%')) AND " +
        "(:description IS null OR LOWER(s.description) LIKE  CONCAT('%', LOWER(cast(:description as string)), '%')) AND " +
        "(:labels IS null OR LOWER(s.labels) LIKE CONCAT('%', LOWER(cast(:labels as string)), '%')) AND " +
        "(:ratingFrom IS null OR s.rating BETWEEN :ratingFrom AND :ratingTo) AND " +
        "(:leadPriceFrom IS null OR s.leadPrice BETWEEN :leadPriceFrom AND :leadPriceTo) AND " +
        "(:tradeName IS null OR EXISTS(SELECT tr FROM s.trades tr WHERE LOWER(tr.name) LIKE CONCAT('%', LOWER(cast(:tradeName as string)), '%')))")
    Page<AdminServiceType> getAll(Long id, String name, String description, String labels, String tradeName, Integer ratingFrom, Integer ratingTo, Integer leadPriceFrom, Integer leadPriceTo, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.AdminServiceType(s, q.id) " +
        "FROM com.improver.entity.ServiceType s " +
        "LEFT JOIN s.questionary q ON q.id = s.questionary.id " +
        "WHERE s.id = ?1")
    Optional<AdminServiceType> getById(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s" +
        " WHERE s.questionary.id = ?1 ORDER BY s.name ASC")
    List<NameIdTuple> getAllServiceTypesByQuestionaryId(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.trades t WHERE t.id = ?1 ORDER BY s.name ASC")
    List<NameIdTuple> getByTradeId(long id);

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.trades t WHERE s.isActive = true AND t.id = ?1 ORDER BY s.name ASC")
    List<OfferedService> getActiveByTradeId(long id);

    @Query("SELECT new com.improver.model.NameIdParentTuple(s.id, s.name, t.id) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.trades t WHERE s.isActive = true AND t.id IN ?1 ORDER BY s.name ASC")
    List<NameIdParentTuple> getActiveByTradeIds(List<Long> ids);

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice, t.id) FROM com.improver.entity.ServiceType s" +
            " INNER JOIN s.trades t WHERE s.isActive = true AND t.id IN ?1 ORDER BY s.name ASC")
    List<OfferedService> getTradeServicesByIds(List<Long> ids);

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice) FROM com.improver.entity.ServiceType s" +
        " WHERE s.isActive = true ORDER BY s.name ASC")
    List<OfferedService> getAllActiveAsModels();

    @Query("SELECT new com.improver.model.NameIdParentTuple(s.id, s.name, q.id) FROM com.improver.entity.ServiceType s " +
        "INNER JOIN s.questionary q WHERE q.id = s.questionary ORDER BY s.name ASC")
    List<NameIdParentTuple> getAllWithQuestionary();

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s WHERE s.questionary IS NOT NULL ORDER BY s.name ASC")
    List<NameIdTuple> getAllWithQuestionaryTupple();

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s WHERE s.questionary IS NULL ORDER BY s.name ASC")
    List<NameIdTuple> getAllWithOutQuestionary();

    @Deprecated
    @Query("SELECT new com.improver.model.out.NameIdImageTuple(s.id, s.name, s.imageUrl) FROM com.improver.entity.ServiceType s " +
        "WHERE s.isActive = true AND s.imageUrl IS NOT NULL ORDER BY RANDOM()")
    Page<NameIdImageTuple> getRandomWithImageAsModels(Pageable pageable);

    @Query("SELECT new com.improver.model.admin.out.Record(count(s.id), s.name, 'TOP_SERVICE_TYPES') FROM com.improver.entity.ServiceType s " +
        "LEFT JOIN com.improver.entity.Project p ON s.id = p.serviceType.id " +
        "WHERE p.created > :period " +
        "AND p.status != 'INVALID' " +
        "GROUP BY s.id " +
        "ORDER BY count(s.id) DESC, s.name")
    List<Record> getTopServiceTypes(ZonedDateTime period, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.out.Record(count(p.serviceType.id), s.name, 'SERVICE_TYPE_SOLD') FROM com.improver.entity.ServiceType s " +
        "LEFT JOIN com.improver.entity.Project p ON s.id = p.serviceType.id " +
        "LEFT JOIN com.improver.entity.ProjectRequest pr ON p.id = pr.project.id " +
        "WHERE pr.created > :period " +
        "AND p.status != 'INVALID' " +
        "GROUP BY s.id " +
        "ORDER BY count(s.id) DESC, s.name")
    List<Record> getTopServiceTypeByProjectSold(ZonedDateTime period, Pageable pageable);

    ServiceType findByProjectsProjectRequestsReviewId(long reviewId);


    @Query("SELECT new com.improver.model.NameIdTuple(st.id, st.name)  FROM com.improver.entity.ServiceType st " +
        "LEFT JOIN st.projects p " +
        "WHERE st.isActive = true " +
        "GROUP BY st.id " +
        "ORDER BY COUNT(p) DESC")
    Page<NameIdTuple> getPopularServiceTypes(Pageable pageable);

    @Query("SELECT new com.improver.model.NameIdParentTuple(st.id, st.name, t.id)  FROM com.improver.entity.ServiceType st " +
            "LEFT JOIN st.projects p " +
            "LEFT JOIN st.trades t " +
            "WHERE st.isActive = true " +
            "AND t.isAdvertised = true " +
            "GROUP BY st.id, t.id " +
            "ORDER BY COUNT(p.id) DESC")
    List<NameIdParentTuple> getSuggestedServices();

    @Query("SELECT new  com.improver.model.out.NameIdImageTuple(st.id, st.name, st.imageUrl) FROM com.improver.entity.ServiceType st " +
        "WHERE st.isActive = true " +
        "AND st.rating > 0 AND st.imageUrl <> '' AND st.imageUrl IS NOT NULL " +
        "ORDER BY RANDOM()")
    Page<NameIdImageTuple> getRandomPopularServiceTypes(Pageable pageable);


    // COMPANY SERVICES

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice, t.id) FROM com.improver.entity.ServiceType s " +
           "INNER JOIN s.trades t ON t.id IN ?2 " +
           "INNER JOIN s.companies c ON c.id = ?1 " +
           "ORDER BY s.name ASC")
    List<OfferedService> getByCompanyAndTrades(long companyId, List<Long> tradeIds);

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice) FROM com.improver.entity.ServiceType s " +
           "INNER JOIN s.companies c ON c.id = ?1 WHERE s.isActive = true AND s.id NOT IN ?2")
    List<OfferedService> getCompanyServicesExcept(long companyId, List<Long> serviceIds);

    @Query("SELECT new com.improver.model.OfferedService(s.id, s.name, s.leadPrice) FROM com.improver.entity.ServiceType s " +
           "INNER JOIN s.companies c ON c.id = ?1 WHERE s.isActive = true")
    List<OfferedService> getAllCompanyServices(long companyId);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.Company c " +
        "LEFT JOIN c.serviceTypes s " +
        "WHERE c.id = :companyId")
    Page<NameIdTuple> getCompanyServices(long companyId, Pageable pageable);

}
