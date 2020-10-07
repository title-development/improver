package com.improver.repository;

import com.improver.entity.Customer;
import com.improver.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    Optional<UserAddress> findByIdAndCustomer(Long id, Customer customer);
}
