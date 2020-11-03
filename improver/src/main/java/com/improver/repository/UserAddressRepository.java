package com.improver.repository;

import com.improver.entity.Customer;
import com.improver.entity.UserAddress;
import com.improver.model.UserAddressModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    Optional<UserAddress> findByIdAndCustomer(Long id, Customer customer);

    @Query("SELECT new com.improver.model.UserAddressModel(us) FROM com.improver.entity.UserAddress us " +
        "WHERE us.customer.id = :customerId")
    List<UserAddressModel> getAllByCustomerId(Long customerId);
}
