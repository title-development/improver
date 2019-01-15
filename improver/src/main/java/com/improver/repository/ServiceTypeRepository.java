package com.improver.repository;

import com.improver.entity.ServiceType;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminServiceType;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.admin.out.Record;
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
        "(:name IS null OR lower(s.name) LIKE %:name%) AND " +
        "(:description IS null OR lower(s.description) LIKE  %:description%) AND " +
        "(:labels IS null OR lower(s.labels) LIKE %:labels%) AND " +
        "(:ratingFrom IS null OR s.rating BETWEEN :ratingFrom AND :ratingTo) AND " +
        "(:leadPriceFrom IS null OR s.leadPrice BETWEEN :leadPriceFrom AND :leadPriceTo) AND " +
        "(:tradeName IS null OR EXISTS(SELECT tr FROM s.trades tr WHERE lower(tr.name) LIKE %:tradeName%))")
    Page<AdminServiceType> getAll(Long id, String name, String description, String labels, String tradeName, Integer ratingFrom, Integer ratingTo, Integer leadPriceFrom, Integer leadPriceTo, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.AdminServiceType(s, q.id) " +
        "FROM com.improver.entity.ServiceType s " +
        "LEFT JOIN s.questionary q ON q.id = s.questionary.id " +
        "WHERE s.id = ?1")
    Optional<AdminServiceType> getById(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s ORDER BY s.name ASC")
    List<NameIdTuple> getAllAsModels();


    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s " +
        " WHERE s.questionary.id = ?1 ORDER BY s.name ASC")
    List<NameIdTuple> getAllServiceTypesByQuestionaryId(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s " +
        "INNER JOIN s.trades t WHERE t.id = ?1 ORDER BY s.name ASC")
    List<NameIdTuple> getByTradeId(long id);

    @Query("SELECT new com.improver.model.NameIdParentTuple(s.id, s.name, q.id) FROM com.improver.entity.ServiceType s " +
        "INNER JOIN s.questionary q WHERE q.id = s.questionary ORDER BY s.name ASC")
    List<NameIdParentTuple> getAllWithQuestionary();

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s WHERE s.questionary IS NOT NULL ORDER BY s.name ASC")
    List<NameIdTuple> getAllWithQuestionaryTupple();

    @Query("SELECT new com.improver.model.NameIdTuple(s.id, s.name) FROM com.improver.entity.ServiceType s WHERE s.questionary IS NULL ORDER BY s.name ASC")
    List<NameIdTuple> getAllWithOutQuestionary();

    @Query("SELECT new com.improver.model.NameIdParentTuple(s.id, s.name, t.id) FROM com.improver.entity.ServiceType s" +
        " INNER JOIN s.trades t WHERE t.id IN ?1 ORDER BY s.name ASC")
    List<NameIdParentTuple> getByTradeIds(List<Long> ids);


    @Query("SELECT new com.improver.model.out.NameIdImageTuple(s.id, s.name, s.imageUrl) FROM com.improver.entity.ServiceType s ORDER BY s.rating DESC")
    Page<NameIdImageTuple> getPopularAsModels(Pageable pageable);

    @Query("SELECT new com.improver.model.out.NameIdImageTuple(s.id, s.name, s.imageUrl) FROM com.improver.entity.ServiceType s ORDER BY RANDOM()")
    Page<NameIdImageTuple> getRandomAsModels(Pageable pageable);

    @Query("SELECT new com.improver.model.out.NameIdImageTuple(s.id, s.name, s.imageUrl) FROM com.improver.entity.ServiceType s WHERE image_url IS NOT NULL ORDER BY RANDOM()")
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
}
