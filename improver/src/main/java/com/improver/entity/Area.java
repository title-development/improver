package com.improver.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
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

    public Area(String zip, Company company) {
        this.zip = zip;
        this.company = company;
    }
}
