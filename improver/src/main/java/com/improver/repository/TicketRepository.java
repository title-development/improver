package com.improver.repository;

import com.improver.entity.Ticket;
import com.improver.util.enums.Priority;
import com.improver.model.admin.out.StaffTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long>{

    @Query("SELECT new com.improver.model.admin.out.StaffTicket(t, su.id, su.email, su.displayName, u.email, u.role) FROM com.improver.entity.Ticket t " +
        "LEFT JOIN com.improver.entity.Staff s ON s.id = t.assignee.id " +
        "LEFT JOIN com.improver.entity.User su ON su.id = s.id " +
        "LEFT JOIN com.improver.entity.User u ON u.id = t.author.id " +
        "WHERE (:id IS null OR t.id = :id) AND " +
        "(:email IS null OR LOWER(t.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "(:name IS null OR LOWER(t.name) LIKE CONCAT('%', LOWER(cast(:name as string)), '%')) AND " +
        "(:businessName IS null OR LOWER(t.businessName) LIKE CONCAT('%', LOWER(cast(:businessName as string)), '%')) AND " +
        "(:subject IS null OR t.subject = :subject) AND " +
        "(t.status IN :statuses OR :statuses IS null) AND " +
        "(:priority IS null OR t.priority = :priority) AND " +
        "((:author IS null OR LOWER(u.email) LIKE CONCAT('%', LOWER(cast(:author as string)), '%')) " +
        "OR LOWER(u.role) LIKE CONCAT('%', LOWER(cast(:author as string)), '%')) AND " +
        "((:unassignedOnly = true AND t.assignee IS null) OR " +
        "(:unassignedOnly = false AND :assignee IS null OR LOWER(su.email) LIKE CONCAT('%', LOWER(cast(:assignee as string)), '%') " +
        "OR LOWER(su.displayName) LIKE CONCAT('%', LOWER(cast(:assignee as string)), '%')))" )
    Page<StaffTicket> getAll(Long id, String email, String name, String businessName, Ticket.Subject subject,
                             List<Ticket.Status> statuses, Priority priority, String assignee, String author, Boolean unassignedOnly, Pageable pageable);

}
