package com.improver.repository;

import com.improver.entity.Image;
import com.improver.model.NameDataTuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.Image i WHERE i.name = ?1")
    int deleteByName(String name);

    Optional<Image> findByName(String name);

    @Query("SELECT new com.improver.model.NameDataTuple(img) FROM com.improver.entity.Image img " +
        "LEFT JOIN com.improver.entity.Trade tr ON tr.imageUrls LIKE CONCAT('%', img.name, '%')")
    List<NameDataTuple> findAllTradeImages();
}
