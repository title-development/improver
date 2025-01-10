package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import java.time.ZonedDateTime;

@Entity(name = "review_revision_request")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class ReviewRevisionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private ZonedDateTime created = ZonedDateTime.now();
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
    @OneToOne(cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @JoinColumn(name = "review_id", foreignKey = @ForeignKey(name = "review_revision_request_review_fkey"))
    private Review review;
    private String comment;
    private boolean isDeclined = false;

}
