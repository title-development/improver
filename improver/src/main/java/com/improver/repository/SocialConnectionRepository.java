package com.improver.repository;

import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SocialConnectionRepository extends JpaRepository<SocialConnection, Long> {

    SocialConnection findByProviderId(String providerId);

    List<SocialConnection> findAllByUser(User user);

    Optional<SocialConnection> findByUserAndProvider(User user, SocialConnection.Provider provider);
}
