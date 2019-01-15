package com.improver.model.in.registration;

import com.google.maps.model.LatLng;
import lombok.Data;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
public class CoverageTemplate {

    @NotNull
    private LatLng center;

    @Range(min = 5, max = 50, message = "Radius of Service Area should be between 5 and 50 miles")
    private int radius;
}
