package com.improver.model.in.registration;

import com.improver.entity.ExtendedLocation;
import com.improver.util.validator.MaxYearCurrent;
import lombok.Data;
import lombok.experimental.Accessors;
import org.hibernate.validator.constraints.Range;

import javax.validation.Valid;
import javax.validation.constraints.*;

import static com.improver.util.database.DataAccessUtil.*;

@Data
@Accessors(chain = true)
public class CompanyRegistration {

    private String uriName;

    private String logo;

    @Size(min = COMPANY_NAME_MIN_SIZE, max = COMPANY_NAME_MAX_SIZE, message = "Company name should be be between " + COMPANY_NAME_MIN_SIZE + " and" + COMPANY_NAME_MAX_SIZE + "characters")
    private String name;

    @Size(min = COMPANY_DESCRIPTION_MIN_SIZE, max = COMPANY_DESCRIPTION_MAX_SIZE, message = "Company description must be between " + COMPANY_DESCRIPTION_MIN_SIZE + " and" + COMPANY_DESCRIPTION_MAX_SIZE + "characters")
    private String description;

    @Valid
    private ExtendedLocation location;

    private String phone;

    @Email
    private String email;

    @MaxYearCurrent(message = "Company foundation year should be valid")
    @Range(min = 1900, message = "Company foundation year should be valid")
    private int founded;

    private String siteUrl;

}
