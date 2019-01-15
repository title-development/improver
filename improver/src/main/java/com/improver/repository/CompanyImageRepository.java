package com.improver.repository;

import com.improver.entity.CompanyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Set;

public interface CompanyImageRepository  extends JpaRepository<CompanyImage, Long> {

    @Query("SELECT i.name FROM com.improver.entity.CompanyImage i WHERE i.galleryProject.id = ?1 ORDER BY i.created ASC")
    List<String> getImagesByProject(long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.CompanyImage i WHERE i.name = ?1 AND i.galleryProject.id = ?2")
    int deleteByNameAndProjectId(String name, long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.CompanyImage i WHERE i.galleryProject.id = ?2")
    void deleteByProjectId(long projectId);
}
