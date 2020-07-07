package com.improver.repository;

import com.improver.entity.DemoProject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;

import javax.transaction.Transactional;

public interface DemoProjectRepository extends JpaRepository<DemoProject, Long> {

    Page<DemoProject> findByCompanyId(long companyId, Pageable pageable);

    DemoProject findByCompanyIdAndId(long companyId, long id);

    @Modifying
    @Transactional
    void deleteByCompanyIdAndId(long companyId, long id);
}
