package com.improver.model.out;

import com.improver.entity.ExtendedLocation;
import com.improver.entity.Location;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ValidatedLocation {

    private final boolean valid;
    private final ExtendedLocation suggested;
    private final String error;
    private final String validationMsg;


    public static ValidatedLocation suggestion(ExtendedLocation suggested, String error, String validationMsg){
        return new ValidatedLocation(false, suggested, error, validationMsg);
    }

    public static ValidatedLocation valid(ExtendedLocation location){
        return new ValidatedLocation(true, location, null, null);
    }

    public static ValidatedLocation invalid(String error) {
        return new ValidatedLocation(false, null, error, null);
    }
}
