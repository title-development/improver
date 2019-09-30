package com.improver.model.out;

import com.improver.entity.*;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdTuple;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@EqualsAndHashCode(callSuper = true)
@Getter
public class CompanyProfile extends CompanyInfo {

    private String backgroundUrl;
    private final int yearsInBusiness;
    private final boolean isOwner;
    private final int reviewCount;
    private final double rating;
    private final List<String> trades;
    private final List<NameIdTuple> services;
    private final List<String> licenses;
    private final boolean isDeleted;
    private final boolean isApproved;


    public CompanyProfile(Company company, boolean isOwner) {
        super(company);
        this.backgroundUrl = company.getBackgroundUrl();
        this.yearsInBusiness = LocalDate.now().getYear() - company.getFounded();
        this.rating = company.getRating();
        this.reviewCount = company.getReviewCount();

        this.isOwner = isOwner;
        this.trades = collectTrades(company);
        this.services = collectServices(company);
        this.licenses = collectLicenses(company);
        this.isDeleted = company.isDeleted();
        this.isApproved = company.isApproved();
    }



    private static List<String> collectTrades(Company company) {
        List<Trade> trades = company.getTrades();
        if(trades == null) {
            return Collections.emptyList();
        }
        return trades.stream()
            .map(Trade::getName)
            .collect(Collectors.toList());
    }

    private static List<NameIdTuple> collectServices(Company company) {
        List<ServiceType> serviceTypes = company.getServiceTypes();
        if(serviceTypes == null) {
            return Collections.emptyList();
        }
        return serviceTypes.stream()
            .map(serviceType -> new NameIdTuple(serviceType.getId(), serviceType.getName()))
            .collect(Collectors.toList());
    }

    private static List<String> collectLicenses(Company company) {
        List<License> licenses = company.getLicenses();
        if(licenses == null) {
            return Collections.emptyList();
        }
        return licenses.stream()
            .map(license -> license.getAccreditation() + " " + license.getNumber())
            .collect(Collectors.toList());
    }
}
