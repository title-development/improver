package com.improver.repository;

import com.improver.entity.Invitation;
import com.improver.model.admin.AdminServiceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Long> {

    @Query("SELECT i " +
        "FROM com.improver.entity.Invitation i " +
        "WHERE (:id IS null OR i.id = :id) AND " +
        "(:email IS null OR lower(i.email) LIKE %:email%) AND " +
        "(:bonusFrom IS null OR i.bonus BETWEEN :bonusFrom AND :bonusTo)")
    Page<Invitation> getAll(Long id, String email, Integer bonusFrom, Integer bonusTo, Pageable pageable);

    Optional<Invitation> findByEmail(String email);
    Optional<Invitation> findByEmailAndActivatedIsNull(String email);
    Optional<Invitation> findByIdAndActivatedIsNull(Long id);

}
