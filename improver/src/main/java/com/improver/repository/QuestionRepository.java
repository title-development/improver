package com.improver.repository;

import com.improver.entity.Question;
import com.improver.model.NameIdTuple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("SELECT q from com.improver.entity.Question q where q.questionary.id = ?1")
    List<Question> getAllByQuestionaryId(long id);
}
