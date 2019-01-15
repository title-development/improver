package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.UnavailabilityPeriod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UnavailabilityPeriodRepository extends JpaRepository<UnavailabilityPeriod, Long> {

    @Query("SELECT up FROM com.improver.entity.UnavailabilityPeriod up WHERE up.company = ?1 AND up.tillDate >= ?2 ORDER BY id")
    List<UnavailabilityPeriod> getAllByCompany(Company company, LocalDate date);
}
