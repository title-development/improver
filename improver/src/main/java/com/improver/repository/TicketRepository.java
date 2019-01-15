package com.improver.repository;

import com.improver.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TicketRepository extends JpaRepository<Ticket, Long>{

    @Query("SELECT t FROM com.improver.entity.Ticket t " +
        "WHERE (:id IS null OR t.id = :id) AND " +
        "(:email IS null OR t.email = :email) AND " +
        "(:name IS null OR t.email = :name) AND " +
        "(:businessName IS null OR t.businessName = :businessName) AND "+
        "(:option IS null OR t.option = :option) AND "+
        "(:status IS null OR t.status = :status)" )
    Page<Ticket> getAll(Long id, String email, String name, String businessName, Ticket.Option option,
                        Ticket.Status status, Pageable pageable);

}
