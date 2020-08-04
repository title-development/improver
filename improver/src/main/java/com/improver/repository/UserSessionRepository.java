package com.improver.repository;

import com.improver.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserSessionRepository  extends JpaRepository<UserSession, Long> {
}
