package com.improver.repository;

import com.improver.entity.Notification;
import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
import com.improver.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, String> {

    List<ProjectMessage> getByProjectRequestIdOrderByCreatedAsc(long projectRequestId);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.ProjectMessage m SET m.isRead = true" +
        " WHERE m.projectRequest.id = ?1 AND m.sender <> ?2 AND m.isRead = false AND m.created < ?3")
    void markAsReadAfter(long projectRequestId, String sender, ZonedDateTime lastReadTime);

    Optional<ProjectMessage> findTop1ByProjectRequestOrderByCreatedDesc(ProjectRequest projectRequest);

    @Query("SELECT COUNT(m.id) FROM com.improver.entity.ProjectMessage m " +
        "INNER JOIN com.improver.entity.ProjectRequest p ON p.id = m.projectRequest.id " +
        "WHERE m.projectRequest.id = :projectRequestId " +
        "AND p.status IN ('HIRED', 'ACTIVE') " +
        "AND m.isRead = false " +
        "AND m.sender != :senderId")
    Long getUnreadMessagesCount(String senderId, Long projectRequestId);

    @Query("SELECT new com.improver.entity.Notification(pr.id, st.name, c.name, p.id, c.id, max(pm.created)) " +
        "FROM com.improver.entity.ProjectMessage pm " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = pm.projectRequest.id " +
        "INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id " +
        "INNER JOIN com.improver.entity.ServiceType st ON st.id = p.serviceType.id " +
        "INNER JOIN com.improver.entity.Customer cus ON p.customer.id = cus.id " +
        "INNER JOIN com.improver.entity.Contractor ctr ON ctr.id = pr.contractor.id " +
        "INNER JOIN com.improver.entity.Company c ON c.id = ctr.company.id " +
        "WHERE pm.isRead = false " +
        "AND cus.id = :userId " +
        "AND pm.sender != cast(:userId as string) " +
        "AND pr.status IN ('ACTIVE', 'HIRED') " +
        "GROUP BY pr.id, st.name, c.name, p.id, c.id " +
        "ORDER BY max(pm.created) DESC")
    List<Notification> getAllUnreadMessagesForCustomers(Long userId);

    @Query("SELECT new com.improver.entity.Notification(pr.id, st.name, cus.displayName, cus.id, max(pm.created)) " +
        "FROM com.improver.entity.ProjectMessage pm " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = pm.projectRequest.id " +
        "INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id " +
        "INNER JOIN com.improver.entity.ServiceType st ON st.id = p.serviceType.id " +
        "INNER JOIN com.improver.entity.Customer cus ON p.customer.id = cus.id " +
        "INNER JOIN com.improver.entity.Contractor ctr ON ctr.id = pr.contractor.id " +
        "WHERE pm.isRead = false " +
        "AND ctr.id = :userId " +
        "AND pm.sender != cast(:userId as string) " +
        "AND pr.status IN ('ACTIVE', 'HIRED') " +
        "GROUP BY pr.id, st.name, cus.id, cus.displayName " +
        "ORDER BY max(pm.created) DESC")
    List<Notification> getAllUnreadMessagesForContractors(Long userId);
}
