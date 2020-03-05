package com.improver.model.admin;

import com.improver.entity.Company;
import com.improver.entity.ExtendedLocation;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class CompanyModel {

    private Long id;
    private String name;
    private String iconUrl;
    private String backgroundUrl;
    private String description;
    private ExtendedLocation location;
    private int founded;
    private String siteUrl;
    private ZonedDateTime created;
    private ZonedDateTime updated;
    private Boolean isDeleted;
    private Boolean isApproved;
    private double rating;
    private int balance;


    public CompanyModel(Company company){
        this.id = company.getId();
        this.name = company.getName();
        this.iconUrl = company.getIconUrl();
        this.backgroundUrl = company.getBackgroundUrl();
        this.description = company.getDescription();
        this.location = company.getLocation();
        this.founded = company.getFounded();
        this.siteUrl = company.getSiteUrl();
        this.created = company.getCreated();
        this.updated = company.getUpdated();
        this.isDeleted = company.isDeleted();
        this.isApproved = company.isApproved();
        this.rating = company.getRating();
        this.balance = company.getBilling().getBalance();
    }
}
