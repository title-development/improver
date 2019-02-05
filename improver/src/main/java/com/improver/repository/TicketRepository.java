package com.improver.repository;

import com.improver.entity.Ticket;
import com.improver.enums.Priority;
import com.improver.model.admin.out.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long>{

    @Query("SELECT new com.improver.model.admin.out.SupportTicket(t, u.email, u.displayName) FROM com.improver.entity.Ticket t " +
        "LEFT JOIN com.improver.entity.Staff s ON s.id = t.assignee.id " +
        "LEFT JOIN com.improver.entity.User u ON u.id = s.id " +
        "WHERE (:id IS null OR t.id = :id) AND " +
        "(:email IS null OR t.email = :email) AND " +
        "(:name IS null OR t.email = :name) AND " +
        "(:businessName IS null OR t.businessName = :businessName) AND " +
        "(:option IS null OR t.option = :option) AND " +
        "(t.status IN :statuses OR :statuses IS null) AND " +
        "(:priority IS null OR t.priority = :priority) AND " +
        "((:unassignedOnly = true AND t.assignee IS null) OR " +
        "(:unassignedOnly = false AND :assignee IS null OR lower(u.email) LIKE '%' || lower(cast(:assignee as string)) || '%' " +
        "OR lower(u.displayName) LIKE '%' || lower(cast(:assignee as string)) || '%'))" )
    Page<SupportTicket> getAll(Long id, String email, String name, String businessName, Ticket.Option option,
                               List<Ticket.Status> statuses, Priority priority, String assignee, Boolean unassignedOnly, Pageable pageable);

}
