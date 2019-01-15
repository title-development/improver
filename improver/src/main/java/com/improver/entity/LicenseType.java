package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.improver.enums.State;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;


@Data
@Accessors(chain = true)
@Entity(name = "license_types")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"state", "accreditation"})})
public class LicenseType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Enumerated(EnumType.STRING)
    private State state;

    private String accreditation;

}
