package com.improver.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import static com.improver.util.database.DataRestrictions.CD_DOUBLE;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
@AllArgsConstructor
public class Centroid {

    @Column(columnDefinition = CD_DOUBLE)
    private Double lat;

    @Column(columnDefinition = CD_DOUBLE)
    private Double lng;
}
