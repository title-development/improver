package com.improver.repository;

import com.improver.entity.StaffAction;
import com.improver.model.out.StaffActionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface StaffActionRepository extends JpaRepository<StaffAction, Long> {

    @Query("SELECT new com.improver.model.out.StaffActionModel(a.id, a.author.email, a.description, a.action, a.created) " +
        "FROM com.improver.entity.StaffAction a WHERE " +
        "(:id IS null OR a.id = :id) AND " +
        "(:author IS null OR lower(cast(a.author.email as text)) LIKE '%' || lower(cast(:author as string)) || '%') AND " +
        "(:action IS null OR a.action = :action)")
    Page<StaffActionModel> getAllBy(Long id, String author, StaffAction.Action action, Pageable pageRequest);
}
