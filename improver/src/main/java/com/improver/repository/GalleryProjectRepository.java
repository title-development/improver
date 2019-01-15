package com.improver.repository;

import com.improver.entity.GalleryProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import javax.transaction.Transactional;
import java.util.List;

public interface GalleryProjectRepository extends JpaRepository<GalleryProject, Long> {

    List<GalleryProject> findByCompanyIdOrderByCreatedDesc(String companyId);

    GalleryProject findByCompanyIdAndId(String companyId, long id);

    @Modifying
    @Transactional
    void deleteByCompanyIdAndId(String companyId, long id);
}
