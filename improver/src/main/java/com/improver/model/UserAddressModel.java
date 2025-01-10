package com.improver.model;

import com.improver.entity.Location;
import com.improver.entity.UserAddress;
import jakarta.persistence.Embedded;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserAddressModel {

    private Long id;
    private String name;
    private Boolean isDefault;

    @Embedded
    private Location location;

    // Fix Pageable and count issue
    public UserAddressModel(Location location, int dummy) {
        this.location = new Location(
            location.getStreetAddress(),
            location.getCity(),
            location.getState(),
            location.getZip(),
            location.getIsAddressManual()
        );
    }

    public UserAddressModel(UserAddress userAddress) {
        this.location = new Location(userAddress);
        this.id = userAddress.getId();
        this.name = userAddress.getName();
        this.isDefault = userAddress.getIsDefault();
    }
}
