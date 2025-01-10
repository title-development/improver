package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import java.util.UUID;

@Entity(name = "review_request")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class ReviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private Long companyId;

    private String reviewToken;

    private String customerEmail;

    private boolean completed = false;

    public ReviewRequest(String customerEmail, Long companyId) {
        this.customerEmail = customerEmail;
        this.companyId = companyId;
        this.reviewToken = UUID.randomUUID().toString();
    }
}
