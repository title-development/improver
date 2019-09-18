package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Column;
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

    //@Column(updatable = false)
    private String city;

    //@Column(updatable = false)
    private String county;

    //@Column(updatable = false)
    private String state;

    public ServedZip(String zip) {
        this.zip = zip;
    }

    public ServedZip(String zip, String county) {
        this.zip = zip;
        this.county = county;
    }
}
