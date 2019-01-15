package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Embeddable;
import javax.validation.constraints.Pattern;


import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
public class Location {

    private String state;
    private String city;
    private String streetAddress;
    private String address2;
    @Pattern(regexp = ZIP_PATTERN_STRING)
    private String zip;


    public Location(String streetAddress, String address2, String city, String state, String zip) {
        this(streetAddress, city, state, zip);
        this.address2 = address2;
    }

    public Location(String streetAddress, String city, String state, String zip) {
        this.state = state;
        this.city = city;
        this.streetAddress = streetAddress;
        this.zip = zip;
    }

    public String asText() {
        return streetAddress + ", " +
            city + ", " +
            state + " " +
            zip;
    }

    public String asTextWithoutStreet() {
        return city + ", " +
            state + " " +
            zip;
    }
}
