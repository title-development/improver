package com.improver.repository;

import com.improver.entity.DemoProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;

public interface DemoProjectImageRepository extends JpaRepository<DemoProjectImage, Long> {

    @Query("SELECT i.name FROM com.improver.entity.DemoProjectImage i WHERE i.demoProject.id = ?1 ORDER BY i.created ASC")
    List<String> getImagesByProject(long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.DemoProjectImage i WHERE i.name = ?1 AND i.demoProject.id = ?2")
    int deleteByNameAndProjectId(String name, long projectId);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.DemoProjectImage i WHERE i.demoProject.id = ?2")
    void deleteByProjectId(long projectId);

    Integer countByDemoProjectId(Long projectId);

}
