package com.improver.repository;

import com.improver.entity.User;
import com.improver.model.admin.AdminContractor;
import com.improver.model.admin.out.Record;
import com.improver.model.projection.ImageProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import javax.transaction.Transactional;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Query("SELECT CASE WHEN count(u)> 0 THEN false ELSE true END FROM com.improver.entity.User u WHERE LOWER(u.email) = LOWER(?1)")
    boolean isEmailFree(String email);

    Optional<User> findByEmail(String email);

    Optional<User> findByValidationKey(String validationKey);

    Page<User> findByRoleIn(List<User.Role> role, Pageable pageable);

    @Query("SELECT u from com.improver.entity.User u WHERE " +
        "(:id IS null OR u.id = :id) AND " +
        "(:email IS null OR LOWER(u.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "(:displayName IS null OR LOWER(u.displayName) LIKE CONCAT('%', LOWER(cast(:displayName as string)), '%')) AND " +
        "(:role IS null OR u.role = :role) AND" +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR u.created BETWEEN :createdFrom AND :createdTo) AND " +
        "((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR u.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<User> findBy(Long id,
                      String email,
                      String displayName,
                      User.Role role,
                      ZonedDateTime createdFrom,
                      ZonedDateTime createdTo,
                      ZonedDateTime updatedFrom,
                      ZonedDateTime updatedTo,
                      Pageable pageable);

    @Query("SELECT c from com.improver.entity.Contractor c WHERE " +
        "c.role = 'CONTRACTOR' AND c.company.id = null AND " +
        "(:id IS null OR c.id = :id) AND " +
        "(:email IS null OR LOWER(c.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "(:displayName IS null OR LOWER(c.displayName) LIKE CONCAT('%', LOWER(cast(:displayName as string)), '%')) AND " +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR c.created BETWEEN :createdFrom AND :createdTo) AND " +
        "((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR c.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<User> findIncompleteProsBy(Long id,
                                    String email,
                                    String displayName,
                                    ZonedDateTime createdFrom,
                                    ZonedDateTime createdTo,
                                    ZonedDateTime updatedFrom,
                                    ZonedDateTime updatedTo,
                                    Pageable pageable);


    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.User u SET u.password = ?2 WHERE u.email = ?1")
    void updatePasswordFor(String email, String newPassword);

    @Query(value = "SELECT case when(u.icon_url LIKE '%https://%') then null else i.data end as image, u.icon_url as redirectUrl FROM users u " +
        "LEFT JOIN images i on u.icon_url LIKE '%https://%' or " +
        "(substring(u.icon_url, length(u.icon_url) - position('/' in reverse(u.icon_url)) + 2, length(u.icon_url)) = i.name) " +
        "WHERE u.id = :userId LIMIT 1",nativeQuery = true)
    ImageProjection getUserIcon(long userId);

    // Fix Pageable and count issue
    @Query("SELECT new com.improver.model.admin.AdminContractor(pro, 0) " +
        "FROM com.improver.entity.Contractor pro WHERE " +
        "(:id IS null OR pro.id = :id) AND " +
        "(:displayName IS null OR LOWER(pro.displayName) LIKE CONCAT('%', LOWER(cast(:displayName as string)),'%')) AND " +
        "(:email IS null OR LOWER(pro.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR pro.created BETWEEN :createdFrom AND :createdTo) AND " +
        "((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR pro.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<AdminContractor> getAllContractors(Long id, String displayName, String email,
                                            ZonedDateTime createdFrom, ZonedDateTime createdTo,
                                            ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                                            Pageable pageable);


    @Query("SELECT new com.improver.model.admin.AdminContractor(pro, c) " +
        "FROM com.improver.entity.Contractor pro " +
        "INNER JOIN pro.company c " +
        "WHERE pro.company.id = c.id AND " +
        "(:id IS null OR pro.id = :id) AND " +
        "(:displayName IS null OR LOWER(pro.displayName) LIKE CONCAT('%', LOWER(cast(:displayName as string)),'%')) AND " +
        "(:email IS null OR LOWER(pro.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "(:companyName IS null OR LOWER(c.name) LIKE CONCAT('%', LOWER(cast(:companyName as string)), '%')) AND " +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR pro.created BETWEEN :createdFrom AND :createdTo) AND " +
        "((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR pro.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<AdminContractor> getAllContractorsJoinCompanies(Long id, String displayName, String email, String companyName,
                                                         ZonedDateTime createdFrom, ZonedDateTime createdTo,
                                                         ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                                                         Pageable pageable);

    @Query("SELECT u  " +
        "FROM com.improver.entity.Customer u " +
        "WHERE " +
        "(:id IS null OR u.id = :id) AND " +
        "(:displayName IS null OR LOWER(u.displayName) LIKE CONCAT('%', LOWER(cast(:displayName as string)), '%')) AND " +
        "(:email IS null OR LOWER(u.email) LIKE CONCAT('%', LOWER(cast(:email as string)), '%')) AND " +
        "((CAST(:createdFrom AS date) IS null OR CAST(:createdTo AS date) IS null) OR u.created BETWEEN :createdFrom AND :createdTo) AND " +
        "((CAST(:updatedFrom AS date) IS null OR CAST(:updatedTo AS date) IS null) OR u.updated BETWEEN :updatedFrom AND :updatedTo)")
    Page<User> getAllCustomers(Long id, String displayName, String email,
                               ZonedDateTime createdFrom, ZonedDateTime createdTo,
                               ZonedDateTime updatedFrom, ZonedDateTime updatedTo,
                               Pageable pageable);

    User findByRefreshId(String refreshToken);

    @Query("SELECT new com.improver.model.admin.out.Record(count(u.id), CAST(u.role as string), 'USERS') FROM com.improver.entity.User u " +
        "WHERE u.role IN ('CUSTOMER', 'CONTRACTOR') " +
        "GROUP BY u.role")
    List<Record> getUsersInSystem();

    @Query(value = "SELECT * FROM (SELECT unnest(string_to_array(:emails, ',')) as email) " +
        " as tmp_table WHERE email NOT IN (SELECT email FROM users) AND email NOT IN (SELECT email FROM invitations)", nativeQuery = true)
    String[] checkAvailableToInviteEmails(String emails);

}
