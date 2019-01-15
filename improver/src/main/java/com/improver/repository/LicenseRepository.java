package com.improver.repository;

import com.improver.entity.License;
import com.improver.model.CompanyLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LicenseRepository extends JpaRepository<License, Long>{

    List<License> findByCompanyIdOrderById(String companyId);

    @Query("SELECT new com.improver.model.CompanyLicense(l.id, l.number, t.accreditation, t.state, l.expired) FROM com.improver.entity.License l" +
        " INNER JOIN l.licenseType t WHERE l.company.id = ?1 ORDER BY t.accreditation ASC")
    List<CompanyLicense> findByCompanyId(String companyId);

    @Query("SELECT new com.improver.model.CompanyLicense(l.id, l.number, t.accreditation, t.state, l.expired) FROM com.improver.entity.License l" +
        " INNER JOIN l.licenseType t WHERE l.company.id = ?1 AND l.id = ?2")
    Optional<CompanyLicense> findByCompanyIdAndLicenseId(String companyId, long licenseId);

}
