package com.improver.repository;

import com.improver.entity.PhoneValidation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PhoneValidationRepository extends JpaRepository<PhoneValidation, Long> {

    Optional<PhoneValidation> findByMessageSidAndCode(String messageSid, String code);

}
