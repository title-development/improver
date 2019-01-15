package com.improver.model.out;

import com.improver.entity.CompanyConfig;
import com.improver.entity.ExtendedLocation;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class CompanyCoverageConfig {
    private CompanyConfig.CoverageConfig coverageConfig;
    private ExtendedLocation companyLocation;
}
