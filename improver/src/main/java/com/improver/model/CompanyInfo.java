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
    protected String iconUrl;
    protected String name;
    protected String description;
    protected ExtendedLocation location;
    protected int founded;
    protected String siteUrl;


    public CompanyInfo(Company company) {
        this.id = company.getId();
        this.iconUrl = company.getIconUrl();
        this.name = company.getName();
        this.description = company.getDescription();
        this.location = company.getExtendedLocation();
        this.founded = company.getFounded();
        this.siteUrl  = company.getSiteUrl();
    }
}
