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
    private final boolean canUseManual;


    public static ValidatedLocation suggestion(ExtendedLocation suggested, String error, String validationMsg, boolean canUseManual){
        return new ValidatedLocation(false, suggested, error, validationMsg, canUseManual);
    }


    public static ValidatedLocation valid(ExtendedLocation suggested, String validationMsg){
        return new ValidatedLocation(true, suggested, null, validationMsg, true);
    }


    public static ValidatedLocation invalid(String error) {
        return new ValidatedLocation(false, null, error, null, false);
    }
}
