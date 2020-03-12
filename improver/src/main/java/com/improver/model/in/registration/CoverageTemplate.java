package com.improver.model.in.registration;

import com.google.maps.model.LatLng;
import lombok.Data;
import org.hibernate.validator.constraints.Range;

import javax.validation.constraints.NotNull;

import static com.improver.util.ErrorMessages.COMPANY_COVERAGE_RADIUS_ERROR_MESSAGE;
import static com.improver.util.database.DataRestrictions.COMPANY_COVERAGE_MAX_RADIUS;
import static com.improver.util.database.DataRestrictions.COMPANY_COVERAGE_MIN_RADIUS;

@Data
public class CoverageTemplate {

    @NotNull
    private LatLng center;

    @Range(min = COMPANY_COVERAGE_MIN_RADIUS, max = COMPANY_COVERAGE_MAX_RADIUS, message = COMPANY_COVERAGE_RADIUS_ERROR_MESSAGE)
    private int radius;
}
