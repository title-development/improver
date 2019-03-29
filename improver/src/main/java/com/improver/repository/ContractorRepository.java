package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.model.QuickReply;
import com.improver.model.admin.AdminContractor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
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


    @Query("SELECT c.company from com.improver.entity.Contractor c" +
        " INNER JOIN c.company com" +
        " INNER JOIN c.projectRequests pc WHERE com IN :eligibleForSubs AND pc.isManual = false" +
        " ORDER BY pc.created DESC")
    List<Company> getLastSubsPurchased(List<Company> eligibleForSubs, Pageable pageable);

}
