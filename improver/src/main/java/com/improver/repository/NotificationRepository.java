package com.improver.repository;

import com.improver.entity.Notification;
import com.improver.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository  extends JpaRepository<Notification, Long> {

    Page<Notification> findAllByUser(User user, Pageable pageRequest);


    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE com.improver.entity.Notification n SET n.isRead = true WHERE n.user = ?1 AND n.id IN ?2")
    void markAsRead(User user, List<Long> ids);

    @Query("SELECT count(n) FROM com.improver.entity.Notification n WHERE n.isRead = false AND n.user = ?1")
    long countUnread(User user);

}
