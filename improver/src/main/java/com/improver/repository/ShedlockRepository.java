package com.improver.repository;

import com.improver.entity.Shedlock;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShedlockRepository extends JpaRepository<Shedlock, Long> {

    Shedlock findByName(String name);

}
