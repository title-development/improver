package com.improver.repository;

import com.improver.entity.Company;
import com.improver.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;


public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    Page<Transaction> findByCompanyId(String companyId, Pageable pageable);

    @Query("SELECT t FROM com.improver.entity.Transaction t WHERE t.type = 'PURCHASE' AND t.isRefunded = false" +
        " AND t.created >= :startDate AND t.created < :endDate" +
        " AND t.company.id = :companyId")
    List<Transaction> findPurchasedByCompanyBetween(String companyId, ZonedDateTime startDate, ZonedDateTime endDate);

    @Query("SELECT COUNT (t) FROM com.improver.entity.Transaction t WHERE t.type = 'PURCHASE'" +
        " AND t.isManualLead = false" +
        " AND t.isRefunded = false" +
        " AND t.created >= :startDate AND t.created < :endDate" +
        " AND t.company.id = :companyId")
    int countSubscriptionPurchasesForPeriod(String companyId, ZonedDateTime startDate, ZonedDateTime endDate);

    Optional<Transaction> findByIdAndCompany(String transactionId, Company company);

    @Query("SELECT t FROM com.improver.entity.Transaction t WHERE t.projectRequest.id = :proProjectRequestId" +
        " AND t.type = :type AND t.company = :company")
    Optional<Transaction> findByTypeAndCompanyAndProject(Transaction.Type type, Company company, long proProjectRequestId);

}
