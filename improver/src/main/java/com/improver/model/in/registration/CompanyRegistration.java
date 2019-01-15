package com.improver.model.in.registration;

import com.improver.entity.ExtendedLocation;
import lombok.Data;
import lombok.experimental.Accessors;
import org.hibernate.validator.constraints.Range;

import javax.validation.Valid;
import javax.validation.constraints.*;

import static com.improver.util.database.DataAccessUtil.COMPANY_DESCRIPTION_SIZE;

@Data
@Accessors(chain = true)
public class CompanyRegistration {

    private String uriName;

    private String logo;

    @Size(min = 2, max = 50, message = "Company name should be valid")
    private String name;

    @Size(min = 20, max = COMPANY_DESCRIPTION_SIZE, message = "Company description must be between 20 and 2500 characters")
    private String description;

    @Valid
    private ExtendedLocation location;

    private String phone;

    @Email
    private String email;

    @Range(min = 1900, max = 2018, message = "Company foundation year should be valid")
    private int founded;

    private String siteUrl;

}
