package com.improver.repository;

import com.improver.entity.Admin;
import com.improver.entity.Support;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupportRepository extends JpaRepository<Support, Long> {

    Optional<Support> findByEmail(String email);
}
