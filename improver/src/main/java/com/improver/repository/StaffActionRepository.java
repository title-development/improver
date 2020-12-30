package com.improver.repository;

import com.improver.entity.StaffAction;
import com.improver.entity.User;
import com.improver.model.out.StaffActionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.ZonedDateTime;

public interface StaffActionRepository extends JpaRepository<StaffAction, Long> {

    @Query("SELECT new com.improver.model.out.StaffActionModel(a.id, a.author.email, a.authorRole, a.description, a.action, a.created) " +
        "FROM com.improver.entity.StaffAction a WHERE " +
        "(:id IS null OR a.id = :id) AND " +
        "(:author IS null OR lower(cast(a.author.email as text)) LIKE '%' || lower(cast(:author as string)) || '%') AND " +
        "(:authorRole IS null OR a.authorRole = :authorRole) AND " +
        "(:action IS null OR a.action = :action) AND " +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR a.created BETWEEN :createdFrom AND :createdTo) ")
    Page<StaffActionModel> getAllBy(Long id, String author, User.Role authorRole, StaffAction.Action action,
                                    ZonedDateTime createdFrom, ZonedDateTime createdTo, Pageable pageRequest);

}
