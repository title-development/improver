package com.improver.repository;

import com.improver.entity.ServedZip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ServedZipRepository extends JpaRepository<ServedZip, String> {

    @Transactional
    void deleteByZipIn(Collection<String> zipCodes);

    @Query("SELECT sz.zip FROM com.improver.entity.ServedZip sz ")
    List<String> getAllServedZips();

    @Query("SELECT COUNT (sz) > 0 FROM com.improver.entity.ServedZip sz WHERE sz.zip =?1")
    boolean isZipServed(String zip);

    @Query("SELECT DISTINCT sz.county FROM com.improver.entity.ServedZip sz ")
    List<String> getAllServedCounties();

    Optional<ServedZip> findByZip(String zip);
}
