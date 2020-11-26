package com.improver.repository;

import com.improver.entity.ProjectImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ProjectImageRepository extends JpaRepository<ProjectImage, Long> {

    Optional<ProjectImage> findByName(String name);

    @Modifying
    @Transactional
    @Query("DELETE FROM com.improver.entity.ProjectImage i WHERE i.name = ?1 AND i.project.id = ?2")
    int deleteByNameAndProjectId(String name, long projectId);

    @Query("SELECT i.name FROM com.improver.entity.ProjectImage i WHERE i.project.id = ?1 ORDER BY i.created ASC")
    List<String> getImageUrlsByProject(long projectId);

    Integer countByProjectId(Long projectId);

}
