package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.enums.State;
import com.improver.model.CompanyLicense;
import com.improver.util.serializer.SerializationUtil;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.LocalDate;


@Data
@Accessors(chain = true)
@Entity(name = "licenses")
public class License {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "license_company_fkey"))
    private Company company;

    @Enumerated(EnumType.STRING)
    private State state;

    private String accreditation;

    private String number;

    @JsonFormat(pattern = SerializationUtil.DATE_PATTERN)
    private LocalDate expired;

}
