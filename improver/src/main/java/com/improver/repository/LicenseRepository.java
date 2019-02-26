package com.improver.repository;

import com.improver.entity.License;
import com.improver.model.CompanyLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long>{

    List<License> findByCompanyIdOrderById(String companyId);

    @Query("SELECT new com.improver.model.CompanyLicense(l.id, l.number, l.accreditation, l.state, l.expired) FROM com.improver.entity.License l " +
        "WHERE l.company.id = ?1 ORDER BY l.accreditation ASC")
    List<CompanyLicense> findByCompanyId(String companyId);

    @Query("SELECT new com.improver.model.CompanyLicense(l.id, l.number, l.accreditation, l.state, l.expired) FROM com.improver.entity.License l " +
        "WHERE l.id = ?1 AND l.company.id = ?2")
    Optional<CompanyLicense> findByIdAndCompanyId(long licenseId, String companyId);

    @Transactional
    void deleteByIdAndCompanyId(long id, String companyId);

}
