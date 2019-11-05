package com.improver.repository;

import com.improver.entity.DemoProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import javax.transaction.Transactional;
import java.util.List;

public interface DemoProjectRepository extends JpaRepository<DemoProject, Long> {

    List<DemoProject> findByCompanyIdOrderByCreatedDesc(long companyId);

    DemoProject findByCompanyIdAndId(long companyId, long id);

    @Modifying
    @Transactional
    void deleteByCompanyIdAndId(long companyId, long id);
}
