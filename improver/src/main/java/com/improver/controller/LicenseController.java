package com.improver.controller;

import com.improver.model.CompanyLicense;
import com.improver.service.CompanyLicenseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.improver.application.properties.Path.*;


@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + LICENSES)
public class LicenseController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private CompanyLicenseService companyLicenseService;

    @GetMapping
    public ResponseEntity<List<CompanyLicense>> getCompanyLicenses(@PathVariable String companyId) {
        List<CompanyLicense> licenses = companyLicenseService.getLicenses(companyId);
        return new ResponseEntity<>(licenses, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> addCompanyLicenses(@PathVariable String companyId, @RequestBody CompanyLicense license) {
        companyLicenseService.saveLicense(companyId, license);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<Void> updateCompanyLicense(@PathVariable String companyId, @RequestBody CompanyLicense license) {
        companyLicenseService.saveLicense(companyId, license);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<CompanyLicense> getCompanyLicense(@PathVariable String companyId, @PathVariable long id) {
        CompanyLicense license = companyLicenseService.getLicense(companyId, id);
        return new ResponseEntity<>(license, HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteCompanyLicense(@PathVariable String companyId, @PathVariable long id) {
        companyLicenseService.deleteLicense(companyId, id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
