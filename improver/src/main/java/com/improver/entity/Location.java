package com.improver.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import static com.improver.util.serializer.SerializationUtil.ZIP_PATTERN_STRING;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@MappedSuperclass
@Embeddable
public class Location {

    @NotNull
    private String streetAddress;
    @NotNull
    private String city;
    @NotNull
    private String state;
    @Pattern(regexp = ZIP_PATTERN_STRING)
    private String zip;
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
        this(userAddress.getLocation().getStreetAddress(), userAddress.getLocation().getCity(), userAddress.getLocation().getState(), userAddress.getLocation().getZip());
        this.isAddressManual = userAddress.getLocation().getIsAddressManual();
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


    public boolean equalsIgnoreCase(Location o) {
        if (this == o) return true;
        if (o == null) return false;
        return state.equalsIgnoreCase(o.state) &&
            city.equalsIgnoreCase(o.city) &&
            streetAddress.equalsIgnoreCase(o.streetAddress) &&
            zip.equals(o.zip);
    }
}
