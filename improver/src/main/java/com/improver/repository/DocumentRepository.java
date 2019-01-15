package com.improver.repository;

import com.improver.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    Document findByName(String name);

}
