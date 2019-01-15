package com.improver.repository;

import com.improver.entity.LicenseType;
import com.improver.enums.State;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface LicenseTypeRepository extends JpaRepository<LicenseType, Long> {

    List<LicenseType> findByStateOrderByAccreditation(State state);

    @Query("SELECT t FROM com.improver.entity.LicenseType t " +
        "WHERE (:id IS null OR t.id = :id) AND " +
        "(:state IS null OR lower(cast(t.state as text)) LIKE '%' || lower(cast(:state as string)) || '%') AND " +
        "(:accreditation IS null OR lower(t.accreditation) LIKE '%' || lower(cast(:accreditation as string)) || '%')")
    Page<LicenseType> getAll(Long id, String state, String accreditation, Pageable pageable);

    Optional<LicenseType> findByStateAndAccreditation(State state, String accreditation);

}
