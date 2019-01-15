package com.improver.repository;

import com.improver.entity.ProjectAction;
import com.improver.entity.RefundAction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RefundActionRepository extends JpaRepository<RefundAction, Long> {

    List<RefundAction> findAllByRefund_Id(long id);
}
