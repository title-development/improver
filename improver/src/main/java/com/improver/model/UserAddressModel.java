package com.improver.model;

import com.improver.entity.Location;
import com.improver.entity.Trade;
import com.improver.entity.UserAddress;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserAddressModel extends Location {

    private Long id;
    private String name;
    private Boolean isDefault;

    // Fix Pageable and count issue
    public UserAddressModel(Location location, int dummy) {
        super(location.getStreetAddress(), location.getCity(), location.getState(), location.getZip(), location.getIsAddressManual());
    }

    public UserAddressModel(UserAddress userAddress) {
        super(userAddress);
        this.id = userAddress.getId();
        this.name = userAddress.getName();
        this.isDefault = userAddress.getIsDefault();
    }
}
