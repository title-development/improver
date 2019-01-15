package com.improver.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import javax.validation.constraints.Size;


@Data
@Accessors(chain = true)
@Entity(name = "areas")
@Table(
    uniqueConstraints= @UniqueConstraint(columnNames={"company_id", "zip"})
)
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(length = 5)
    private String zip;

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;
}
