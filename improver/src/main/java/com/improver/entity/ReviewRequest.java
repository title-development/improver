package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.util.UUID;

@Entity(name = "review_request")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class ReviewRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String companyId;

    private String reviewToken;

    private String customerEmail;

    private boolean completed = false;

    public ReviewRequest(String customerEmail, String companyId) {
        this.customerEmail = customerEmail;
        this.companyId = companyId;
        this.reviewToken = UUID.randomUUID().toString();
    }
}
