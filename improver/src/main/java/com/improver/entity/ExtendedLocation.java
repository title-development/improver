package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.Pattern;

import static com.improver.util.database.DataAccessUtil.CD_DOUBLE;
import static com.improver.util.serializer.SerializationUtil.CITY_PATTERN_STRING;
import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;


@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
public class ExtendedLocation {

    private String state;

    @Pattern(regexp = CITY_PATTERN_STRING, message = "Incorrect city name")
    private String city;

    private String streetAddress;

    @Pattern(regexp = ZIP_PATTERN_STRING, message = "Incorrect zip code")
    private String zip;

    @Column(columnDefinition = CD_DOUBLE)
    private Double lat;

    @Column(columnDefinition = CD_DOUBLE)
    private Double lng;




    public ExtendedLocation(String streetAddress, String city, String state, String zip, double lat, double lng) {
        this.state = state;
        this.city = city;
        this.streetAddress = streetAddress;
        this.zip = zip;
        this.lat = lat;
        this.lng = lng;
    }

    public ExtendedLocation(Location location, double lat, double lng) {
        this(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), lat, lng);
    }

    public Location withOutCoordinates(){
        return new Location(this.streetAddress, this.city, this.state, this.zip);
    }
}
