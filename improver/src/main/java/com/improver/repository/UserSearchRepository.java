package com.improver.repository;

import com.improver.entity.UserSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserSearchRepository extends JpaRepository<UserSearch, Long> {

}
