package com.improver.entity;


import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

import static com.improver.util.database.DataAccessUtil.REVIEW_MESSAGE_MAX_SIZE;

@Data
@Accessors(chain = true)
@Entity(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "company_id", foreignKey = @ForeignKey(name = "review_company_fkey"))
    private Company company;

    @ManyToOne
    @JoinColumn(name = "customer_id", foreignKey = @ForeignKey(name = "review_customer_fkey"))
    private Customer customer;

    @OneToOne(mappedBy = "review")
    private ProjectRequest projectRequest;

    @OneToOne(mappedBy = "review")
    private ReviewRevisionRequest reviewRevisionRequest;

    private ZonedDateTime created = ZonedDateTime.now();

    private ZonedDateTime updated = ZonedDateTime.now();

    private ZonedDateTime publishDate = ZonedDateTime.now();

    private boolean isPublished;

    @Column(length = REVIEW_MESSAGE_MAX_SIZE)
    private String description;

    private int score;


}
