package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.Id;

@Data
@Accessors(chain = true)
@Entity(name = "served_zips")
@NoArgsConstructor
public class ServedZip {

    @Id
    @Column(updatable = false, length = 5)
    private String zip;

    @Embedded
    private Centroid centroid;

    //@Column(updatable = false)
    private String county;

    //@Column(updatable = false)
    private String state;

    public ServedZip(String zip) {
        this.zip = zip;
    }

    public ServedZip(String zip, String county, Centroid centroid) {
        this.zip = zip;
        this.county = county;
        this.centroid = centroid;
    }
}
