package com.improver.repository;

import com.improver.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.Image i WHERE i.name = ?1")
    int deleteByName(String name);

    Optional<Image> findByName(String name);
}
