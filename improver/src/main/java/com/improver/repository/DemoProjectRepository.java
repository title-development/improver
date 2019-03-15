package com.improver.repository;

import com.improver.entity.DemoProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import javax.transaction.Transactional;
import java.util.List;

public interface DemoProjectRepository extends JpaRepository<DemoProject, Long> {

    List<DemoProject> findByCompanyIdOrderByCreatedDesc(String companyId);

    DemoProject findByCompanyIdAndId(String companyId, long id);

    @Modifying
    @Transactional
    void deleteByCompanyIdAndId(String companyId, long id);
}
