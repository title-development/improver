package com.improver.model;

import com.improver.entity.Location;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserAddressModel extends Location {

    private Long id;
    private String name;
    private Boolean isDefault;


    public UserAddressModel(Location location) {
        super(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), location.getIsAddressManual());
    }
}
