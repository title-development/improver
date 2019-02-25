package com.improver.repository;

import com.improver.entity.Trade;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminTrade;
import com.improver.model.out.NameIdImageTuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    List<Trade> findByIdIn(List<Long> ids);

    List<Trade> findByNameIn(List<String> names);

    List<Trade> findByNameContainingIgnoreCase(String namePart);

    @Query("SELECT new com.improver.model.admin.AdminTrade(t) FROM com.improver.entity.Trade t " +
        "WHERE (:id IS null OR t.id = :id) AND " +
        "(:name IS null OR lower(t.name) LIKE '%' || lower(cast(:name as string)) || '%') AND " +
        "(:description IS null OR lower(t.description) LIKE '%' || lower(cast(:description as string)) || '%') AND " +
        "(:ratingFrom IS null OR t.rating BETWEEN :ratingFrom AND :ratingTo)")
    Page<AdminTrade> getAll(Long id, String name, String description, Integer ratingFrom, Integer ratingTo, Pageable pageable);

    @Query("SELECT new com.improver.model.NameIdTuple(t.id, t.name) FROM com.improver.entity.Trade t" +
        " INNER JOIN t.serviceTypes s WHERE s.id = ?1 ORDER BY s.name ASC")
    List<NameIdTuple> getByServiceTypeId(long id);

    @Query("SELECT new com.improver.model.NameIdTuple(t.id, t.name) FROM com.improver.entity.Trade t ORDER BY t.name ASC")
    List<NameIdTuple> getAllAsModels();

    @Query("SELECT new com.improver.model.out.NameIdImageTuple(t.id, t.name, t.imageUrl) FROM com.improver.entity.Trade t ORDER BY t.rating DESC")
    Page<NameIdImageTuple> getPopular(Pageable pageable);

    @Query("SELECT CASE WHEN count(t)> 0 THEN false ELSE true END FROM com.improver.entity.Trade t WHERE LOWER(t.name) = LOWER(?1)")
    boolean isTradeNameFree(String name);

}
