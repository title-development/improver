package com.improver.model.in.registration;

import com.improver.model.TradesServicesCollection;
import lombok.Data;

import javax.validation.Valid;

@Data
public class ContractorRegistration {

    @Valid
    private UserRegistration contractor;

    @Valid
    private CompanyRegistration company;

    @Valid
    private TradesServicesCollection tradesAndServices;

    @Valid
    private CoverageTemplate coverage;
}
