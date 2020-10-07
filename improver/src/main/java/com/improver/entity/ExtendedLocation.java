package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.validation.constraints.Pattern;

import static com.improver.util.database.DataRestrictions.CD_DOUBLE;
import static com.improver.util.serializer.SerializationUtil.CITY_PATTERN_STRING;
import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;


@Data
@Accessors(chain = true)
@NoArgsConstructor
@Embeddable
public class ExtendedLocation extends Location {

    @Column(columnDefinition = CD_DOUBLE)
    private Double lat;

    @Column(columnDefinition = CD_DOUBLE)
    private Double lng;


    public ExtendedLocation(String streetAddress, String city, String state, String zip, boolean isAddressManual) {
        super(streetAddress, city, state, zip, isAddressManual);
    }


    public ExtendedLocation(Location location, double lat, double lng) {
        super(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), location.getIsAddressManual());
        this.lat = lat;
        this.lng = lng;
    }


    public Location withOutCoordinates(){
        return new Location(this.getStreetAddress(), this.getCity(), this.getState(), this.getZip(), this.getIsAddressManual());
    }
}
