package com.improver.repository;

import com.improver.entity.DemoProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;
import java.util.List;

public interface DemoProjectImageRepository extends JpaRepository<DemoProjectImage, Long> {

    @Query("SELECT i.name FROM com.improver.entity.DemoProjectImage i WHERE i.demoProject.id = :projectId ORDER BY i.created ASC")
    List<String> getImagesByProject(long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.DemoProjectImage i WHERE i.name = :name AND i.demoProject.id = :projectId")
    int deleteByNameAndProjectId(String name, long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.DemoProjectImage i WHERE i.demoProject.id = :projectId")
    void deleteByProjectId(long projectId);

    Integer countByDemoProjectId(Long projectId);

}
