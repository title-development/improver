package com.improver.entity;

import jakarta.persistence.Embedded;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.Pattern;

import static com.improver.util.database.DataRestrictions.CD_DOUBLE;
import static com.improver.util.serializer.SerializationUtil.CITY_PATTERN_STRING;
import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;


@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
public class ExtendedLocation {

    @Column(columnDefinition = CD_DOUBLE)
    private Double lat;

    @Column(columnDefinition = CD_DOUBLE)
    private Double lng;

    @Embedded
    private Location location;


    public ExtendedLocation(String streetAddress, String city, String state, String zip, boolean isAddressManual) {
        this.location = new Location(streetAddress, city, state, zip, isAddressManual);
    }


    public ExtendedLocation(Location location, double lat, double lng) {
        this.location = new Location(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), location.getIsAddressManual());
        this.lat = lat;
        this.lng = lng;
    }


    public Location withOutCoordinates() {
        return new Location(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), location.getIsAddressManual());
    }
}
