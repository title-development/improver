package com.improver.repository;

import com.improver.entity.Contractor;
import com.improver.model.QuickReply;
import com.improver.model.admin.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;


public interface ContractorRepository extends JpaRepository<Contractor, Long> {

    Optional<Contractor> findByEmail(String email);

    @Transactional
    @Modifying
    @Query("UPDATE com.improver.entity.Contractor c SET c.quickReply = ?2, c.replyText = ?3 WHERE c.id = ?1")
    void updateQuickReply(long id, boolean quickReply, String replyText);

    @Query("SELECT new com.improver.model.QuickReply(c.quickReply, c.replyText) FROM com.improver.entity.Contractor c WHERE c.id = ?1")
    QuickReply getQuickReply(long contractorId);

    Optional<Contractor> getContractorByRefCode(String refCode);

    @Query("SELECT new com.improver.model.admin.UserModel(pro) " +
        "FROM com.improver.entity.Contractor pro " +
        "INNER JOIN pro.company c " +
        "WHERE pro.company.id = c.id AND " +
        "(:id IS null OR c.id = :id)")
    List<UserModel> findByCompanyId(Long id);

}
