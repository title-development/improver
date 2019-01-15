package com.improver.repository;

import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
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
        "AND p.status IN ('HIRED', 'ACTIVE')" +
        "AND m.isRead = false " +
        "AND m.sender != :senderId")
    Long getUnreadMessagesCount(String senderId, Long projectRequestId);
}
