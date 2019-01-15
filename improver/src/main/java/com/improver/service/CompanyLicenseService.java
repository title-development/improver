package com.improver.service;

import com.improver.entity.Company;
import com.improver.entity.License;
import com.improver.entity.LicenseType;
import com.improver.exception.NotFoundException;
import com.improver.model.CompanyLicense;
import com.improver.repository.CompanyRepository;
import com.improver.repository.LicenseRepository;
import com.improver.repository.LicenseTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class CompanyLicenseService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private CompanyRepository companyRepository;
    @Autowired private LicenseRepository licenseRepository;
    @Autowired private LicenseTypeRepository licenseTypeRepository;

    public List<CompanyLicense> getLicenses(String companyId) {
        return licenseRepository.findByCompanyId(companyId);
    }

    public void saveLicense(String companyId, CompanyLicense companyLicense) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        LicenseType licenseType = licenseTypeRepository.findByStateAndAccreditation(
            companyLicense.getState(),
            companyLicense.getAccreditation())
            .orElseThrow(NotFoundException::new);
        License license = new License()
            .setId(companyLicense.getId())
            .setLicenseType(licenseType)
            .setCompany(company)
            .setExpired(companyLicense.getExpired())
            .setNumber(companyLicense.getNumber());
        licenseRepository.save(license.setCompany(company));
    }

    public void deleteLicense(String companyId, long licenseId) {
        licenseRepository.deleteById(licenseId);
    }

    public CompanyLicense getLicense(String companyId, long licenseId) {
        return licenseRepository.findByCompanyIdAndLicenseId(companyId, licenseId)
            .orElseThrow(NotFoundException::new);
    }
}
