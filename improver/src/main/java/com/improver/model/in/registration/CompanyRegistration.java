package com.improver.model.in.registration;

import com.improver.model.TradesServicesCollection;
import lombok.Data;

import jakarta.validation.Valid;

@Data
public class CompanyRegistration {

    @Valid
    private CompanyDetails company;

    @Valid
    private TradesServicesCollection tradesAndServices;

    @Valid
    private CoverageTemplate coverage;
}
