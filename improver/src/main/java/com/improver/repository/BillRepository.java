package com.improver.repository;

import com.improver.entity.Billing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Billing, Long> {

    @Query("SELECT b FROM com.improver.entity.Billing b WHERE b.subscription.active = true")
    List<Billing> findBySubscription();

    Optional<Billing> findByCompanyId(String companyId);

}
