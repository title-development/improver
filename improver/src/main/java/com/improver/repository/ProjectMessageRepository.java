package com.improver.repository;

import com.improver.entity.*;
import com.improver.model.tmp.UnreadProjectMessageInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, String> {

    List<ProjectMessage> getByProjectRequestIdOrderByCreatedAsc(long projectRequestId);

    @Query("SELECT m FROM com.improver.entity.ProjectMessage m " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = m.projectRequest.id " +
        "WHERE pr.id = :projectRequestId " +
        "AND pr.contractor = :contractor GROUP BY(m.id) ORDER BY max(m.created) ASC")
    List<ProjectMessage> getForContractor(long projectRequestId, User contractor);

    @Query("SELECT m FROM com.improver.entity.ProjectMessage m " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = m.projectRequest.id " +
        "INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id " +
        "WHERE pr.id = :projectRequestId " +
        "AND p.customer = :customer GROUP BY(m.id) ORDER BY max(m.created) ASC")
    List<ProjectMessage> getForCustomer(long projectRequestId, User customer);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.ProjectMessage m SET m.isRead = true" +
        " WHERE m.projectRequest.id = ?1 AND m.sender <> ?2 AND m.isRead = false AND m.created < ?3")
    void markAsReadAfter(long projectRequestId, String sender, ZonedDateTime lastReadTime);

    Optional<ProjectMessage> findTop1ByProjectRequestOrderByCreatedDesc(ProjectRequest projectRequest);

    @Query("SELECT COUNT(m.id) FROM com.improver.entity.ProjectMessage m " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = m.projectRequest.id " +
        "WHERE m.projectRequest.id = :projectRequestId " +
        "AND pr.status IN :projectRequestStatuses " +
        "AND m.isRead = false " +
        "AND m.sender <> :senderId")
    Long getUnreadMessagesCount(String senderId, Long projectRequestId, List <ProjectRequest.Status> projectRequestStatuses);

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
        "AND pr.status IN :projectRequestStatuses " +
        "GROUP BY pr.id, st.name, c.name, p.id, c.id " +
        "ORDER BY max(pm.created) DESC")
    List<Notification> getAllUnreadMessagesForCustomers(Long userId, List <ProjectRequest.Status> projectRequestStatuses);

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
        "AND pr.status IN :projectRequestStatuses " +
        "GROUP BY pr.id, st.name, cus.id, cus.displayName " +
        "ORDER BY max(pm.created) DESC")
    List<Notification> getAllUnreadMessagesForContractors(Long userId, List <ProjectRequest.Status> projectRequestStatuses);

    @Query("SELECT new com.improver.model.tmp.UnreadProjectMessageInfo(cus.email, st.name) " +
        "FROM com.improver.entity.ProjectMessage pm " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = pm.projectRequest.id " +
        "INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id " +
        "INNER JOIN com.improver.entity.ServiceType st ON st.id = p.serviceType.id " +
        "INNER JOIN com.improver.entity.Customer cus ON p.customer.id = cus.id " +
        "WHERE (pm.created BETWEEN :dateFrom AND :dateTo) " +
        "AND pr.status IN :projectRequestStatuses " +
        "AND pm.isRead = false " +
        "AND pm.sender != cast(cus.id as string) " +
        "AND pm.sender != 'system' " +
        "GROUP BY p.id, cus.email, st.name")
    List<UnreadProjectMessageInfo> getCustomersWithUnreadMessagesByCreatedDateBetween(ZonedDateTime dateFrom, ZonedDateTime dateTo, List <ProjectRequest.Status> projectRequestStatuses);

    @Query("SELECT new com.improver.model.tmp.UnreadProjectMessageInfo(ctr.email, st.name, cus.displayName) " +
        "FROM com.improver.entity.ProjectMessage pm " +
        "INNER JOIN com.improver.entity.ProjectRequest pr ON pr.id = pm.projectRequest.id " +
        "INNER JOIN com.improver.entity.Project p ON p.id = pr.project.id " +
        "INNER JOIN com.improver.entity.ServiceType st ON st.id = p.serviceType.id " +
        "INNER JOIN com.improver.entity.Customer cus ON p.customer.id = cus.id " +
        "INNER JOIN com.improver.entity.Contractor ctr ON ctr.id = pr.contractor.id " +
        "WHERE (pm.created BETWEEN :dateFrom AND :dateTo) " +
        "AND pr.status IN :projectRequestStatuses " +
        "AND pm.isRead = false " +
        "AND pm.sender != cast(ctr.id as string) " +
        "AND pm.sender != 'system' " +
        "GROUP BY pr.id, ctr.email, cus.displayName, st.name")
    List<UnreadProjectMessageInfo> getContractorsWithUnreadMessagesByCreatedDateBetween(ZonedDateTime dateFrom, ZonedDateTime dateTo, List <ProjectRequest.Status> projectRequestStatuses);

}
