package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Embeddable;
import javax.persistence.MappedSuperclass;
import javax.validation.constraints.Pattern;

import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@MappedSuperclass
@Embeddable
public class Location {

    private String streetAddress;
    private String city;
    private String state;
    @Pattern(regexp = ZIP_PATTERN_STRING) private String zip;


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


    public <T extends Location> boolean equalsIgnoreCase(T o){
        if (this == o) return true;
        if (o == null) return false;
        Location location = o;
        return state.equalsIgnoreCase(location.state) &&
            city.equalsIgnoreCase(location.city) &&
            streetAddress.equalsIgnoreCase(location.streetAddress) &&
            zip.equals(location.zip);
    }
}
