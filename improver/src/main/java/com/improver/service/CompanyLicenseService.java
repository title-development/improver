package com.improver.service;

import com.improver.entity.Company;
import com.improver.entity.License;
import com.improver.exception.NotFoundException;
import com.improver.model.CompanyLicense;
import com.improver.repository.LicenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class CompanyLicenseService {

    @Autowired private LicenseRepository licenseRepository;

    public List<CompanyLicense> getLicenses(String companyId) {
        return licenseRepository.findByCompanyId(companyId);
    }

    public void saveLicense(Company company, CompanyLicense companyLicense) {
        License license = new License()
            .setId(companyLicense.getId())
            .setAccreditation(companyLicense.getAccreditation())
            .setState(companyLicense.getState())
            .setCompany(company)
            .setExpired(companyLicense.getExpired())
            .setNumber(companyLicense.getNumber());
        licenseRepository.save(license.setCompany(company));
    }

    public void deleteLicense(Company company, long licenseId) {
        licenseRepository.deleteByIdAndCompanyId(licenseId, company.getId());
    }

    public CompanyLicense getLicense(Company company, long licenseId) {
        return licenseRepository.findByIdAndCompanyId(licenseId, company.getId())
            .orElseThrow(NotFoundException::new);
    }
}
