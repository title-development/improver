package com.improver.model.in.registration;

import com.improver.entity.ExtendedLocation;
import com.improver.util.validator.MaxYearCurrent;
import lombok.Data;
import lombok.experimental.Accessors;
import org.hibernate.validator.constraints.Range;

import javax.validation.Valid;
import javax.validation.constraints.*;

import static com.improver.util.ErrorMessages.*;
import static com.improver.util.database.DataAccessUtil.*;

@Data
@Accessors(chain = true)
public class CompanyRegistration {

    private String uriName;

    private String logo;

    @Size(min = COMPANY_NAME_MIN_SIZE, max = COMPANY_NAME_MAX_SIZE, message = COMPANY_NAME_SIZE_ERROR_MESSAGE)
    private String name;

    @Size(min = COMPANY_DESCRIPTION_MIN_SIZE, max = COMPANY_DESCRIPTION_MAX_SIZE, message = COMPANY_DESCRIPTION_SIZE_ERROR_MESSAGE)
    private String description;

    @Valid
    private ExtendedLocation location;

    private String phone;

    @Email
    private String email;

    @MaxYearCurrent(message = COMPANY_FOUNDATION_ERROR_MESSAGE)
    @Range(min = COMPANY_FOUNDATION_MIN_YEAR, message = COMPANY_FOUNDATION_ERROR_MESSAGE)
    private int founded;

    private String siteUrl;

}
