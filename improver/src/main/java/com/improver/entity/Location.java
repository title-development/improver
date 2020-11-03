package com.improver.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.Embeddable;
import javax.persistence.MappedSuperclass;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@MappedSuperclass
@Embeddable
public class Location {

    @NotNull private String streetAddress;
    @NotNull private String city;
    @NotNull private String state;
    @Pattern(regexp = ZIP_PATTERN_STRING) private String zip;
    private Boolean isAddressManual = false;


    public Location(String streetAddress, String city, String state, String zip) {
        this.state = state;
        this.city = city;
        this.streetAddress = streetAddress;
        this.zip = zip;
    }

    public Location(String streetAddress, String city, String state, String zip, boolean isAddressManual) {
        this(streetAddress, city, state, zip);
        this.isAddressManual = isAddressManual;
    }

    public Location(UserAddress userAddress) {
        this(userAddress.getStreetAddress(), userAddress.getCity(), userAddress.getState(), userAddress.getZip());
        this.isAddressManual = userAddress.getIsAddressManual();
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
