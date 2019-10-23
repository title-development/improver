package com.improver.repository;

import com.improver.entity.UserSearch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


@Repository
public interface UserSearchRepository extends JpaRepository<UserSearch, Long> {

    @Query("SELECT us.search FROM com.improver.entity.UserSearch us " +
        "WHERE us.userId = :customerId " +
        "ORDER BY us.created DESC")
    Page<String> findByCustomerId(String customerId, Pageable pageable);

}
