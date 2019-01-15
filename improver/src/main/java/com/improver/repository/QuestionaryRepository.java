package com.improver.repository;

import com.improver.entity.Questionary;
import com.improver.model.admin.AdminQuestionary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface QuestionaryRepository extends JpaRepository<Questionary, Long> {

    @Query("SELECT CASE WHEN count(q)> 0 THEN false ELSE true END FROM com.improver.entity.Questionary q WHERE LOWER(q.name) = LOWER(?1)")
    boolean isQuestionaryNameFree(String name);

    @Query("SELECT new com.improver.model.admin.AdminQuestionary(q.id, q.name, q.description) " +
            "FROM com.improver.entity.Questionary q " +
            "WHERE (:id IS null OR q.id = :id) AND " +
            "(:name IS null OR lower(q.name) LIKE %:name%)")
    Page<AdminQuestionary> getAll(Long id, String name, Pageable pageable);

    @Query("SELECT new com.improver.model.admin.AdminQuestionary(q.id, q.name, q.description) " +
            "FROM com.improver.entity.Questionary q  WHERE q.id = ?1")
    AdminQuestionary getById(long id);

    boolean existsByServiceTypesId(long id);
    boolean existsByServiceTypesIdIn(Long ...ids);
}
