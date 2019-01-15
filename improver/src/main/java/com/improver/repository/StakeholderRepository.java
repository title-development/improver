package com.improver.repository;

import com.improver.entity.Stakeholder;
import com.improver.entity.Support;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StakeholderRepository extends JpaRepository<Stakeholder, Long> {

    Optional<Stakeholder> findByEmail(String email);
}
