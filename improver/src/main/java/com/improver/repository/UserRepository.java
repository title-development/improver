package com.improver.repository;

import com.improver.entity.User;
import com.improver.model.UserAccount;
import com.improver.model.admin.AdminContractor;
import com.improver.model.admin.out.Record;
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

    @Query("SELECT u from com.improver.entity.User u WHERE " +
        "(:id IS null OR u.id = :id) AND " +
        "(:email IS null OR u.email LIKE %:email%) AND " +
        "(:displayName IS null OR u.displayName LIKE %:displayName%) AND " +
        "(:role IS null OR u.role = :role)")
    Page<User> findBy(Long id,
                      String email,
                      String displayName,
                      User.Role role,
                      Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.User u SET u.lastLogin = ?2, u.refreshId = ?3 WHERE u.email = ?1")
    User updateLastLoginByEmail(String email, ZonedDateTime dateTime, String refreshId);

    @Modifying
    @Transactional
    @Query("UPDATE com.improver.entity.User u SET u.password = ?2 WHERE u.email = ?1")
    void updatePasswordFor(String email, String newPassword);

    @Query("SELECT  new com.improver.model.UserAccount(u.id, u.iconUrl, u.email, u.firstName, u.lastName, u.displayName, u.internalPhone, u.password) " +
        "FROM com.improver.entity.User u WHERE u.id = ?1")
    UserAccount getAccount(long id);

    @Query("SELECT  u.iconUrl FROM com.improver.entity.User u WHERE u.id = ?1")
    Optional<String> getIconUrl(long id);

    @Query("SELECT new com.improver.model.admin.AdminContractor(pro, c) " +
        "FROM com.improver.entity.Contractor pro " +
        "INNER JOIN pro.company c " +
        "WHERE pro.company.id = c.id AND " +
        "(:id IS null OR pro.id = :id) AND " +
        "(:displayName IS null OR lower(pro.displayName) LIKE %:displayName%) AND " +
        "(:email IS null OR lower(pro.email) LIKE %:email%) AND " +
        "(:companyName IS null OR lower(c.name) LIKE %:companyName%)")
    Page<AdminContractor> getAllContractors(Long id, String displayName, String email, String companyName, Pageable pageable);

    @Query("SELECT u  " +
        "FROM com.improver.entity.Customer u " +
        "WHERE " +
        "(:id IS null OR u.id = :id) AND " +
        "(:displayName IS null OR lower(u.displayName) LIKE %:displayName%) AND " +
        "(:email IS null OR lower(u.email) LIKE %:email%) ")
    Page<User> getAllCustomers(Long id, String displayName, String email, Pageable pageable);

    User findByRefreshId(String refreshToken);

    @Query("SELECT new com.improver.model.admin.out.Record(count(u.id), CAST(u.role as string), 'USERS') FROM com.improver.entity.User u " +
        "WHERE u.role IN ('CUSTOMER', 'CONTRACTOR') " +
        "GROUP BY u.role")
    List<Record> getUsersInSystem();
}
