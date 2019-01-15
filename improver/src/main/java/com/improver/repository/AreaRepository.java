package com.improver.repository;

import com.improver.entity.Area;
import com.improver.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;


public interface AreaRepository extends JpaRepository<Area, Long> {

    default void updateAreasForCompany(Company company, List<String> toAdd, List<String> toRemove) {
        if(!toRemove.isEmpty()) {
            deleteZipCodesByCompanyId(company.getId(), toRemove);
        }
        List<Area> areas = toAdd.stream().map(zip -> new Area().setZip(zip).setCompany(company))
            .collect(Collectors.toList());
        saveAll(areas);

    }

    @Query("SELECT a.zip FROM com.improver.entity.Area a WHERE a.company.id = ?1")
    List<String> getZipCodesByCompanyId(String companyId);

    @Transactional
    @Modifying
    @Query("DELETE FROM com.improver.entity.Area a WHERE a.company.id = ?1 AND a.zip IN ?2")
    void deleteZipCodesByCompanyId(String companyId, List<String> zipCodes);

    @Transactional
    @Modifying
    @Query("DELETE FROM com.improver.entity.Area a WHERE a.company = ?1")
    void clearCoverageFor(Company company);
}
