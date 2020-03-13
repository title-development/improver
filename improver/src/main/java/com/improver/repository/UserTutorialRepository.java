package com.improver.repository;

import com.improver.entity.UserTutorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserTutorialRepository extends JpaRepository<UserTutorial, Long> {

    @Query("SELECT ut FROM com.improver.entity.UserTutorial ut " +
        "WHERE ut.user.id = :userId " +
        "AND ut.tutorial in (:tutorials)")
    List<UserTutorial> getCompletedTutorials(List<UserTutorial.Tutorial> tutorials, long userId);
}
