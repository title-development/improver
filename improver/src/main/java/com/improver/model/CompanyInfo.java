package com.improver.model;

import com.improver.entity.Company;
import com.improver.entity.ExtendedLocation;
import com.improver.entity.Location;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
public class CompanyInfo {

    protected long id;
    protected String uriName;
    protected String iconUrl;
    protected String name;
    protected String description;
    protected ExtendedLocation location;
    protected String phone;
    protected String email;
    protected int founded;
    protected String siteUrl;


    public CompanyInfo(Company company) {
        this.id = company.getId();
        this.uriName = company.getUri();
        this.iconUrl = company.getIconUrl();
        this.name = company.getName();
        this.description = company.getDescription();
        this.location = company.getLocation();
        this.phone = company.getInternalPhone();
        this.email = company.getEmail();
        this.founded = company.getFounded();
        this.siteUrl  = company.getSiteUrl();
    }
}
