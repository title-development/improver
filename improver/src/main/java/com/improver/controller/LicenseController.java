package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.exception.NotFoundException;
import com.improver.model.CompanyLicense;
import com.improver.security.UserSecurityService;
import com.improver.service.CompanyLicenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

import static com.improver.application.properties.Path.*;


@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + LICENSES)
public class LicenseController {

    @Autowired private CompanyLicenseService companyLicenseService;
    @Autowired private UserSecurityService userSecurityService;

    @GetMapping
    public ResponseEntity<List<CompanyLicense>> getCompanyLicenses(@PathVariable String companyId) {
        List<CompanyLicense> licenses = companyLicenseService.getLicenses(companyId);
        return new ResponseEntity<>(licenses, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> addCompanyLicenses(@PathVariable String companyId, @RequestBody @Valid CompanyLicense license) {
        Contractor contractor = userSecurityService.currentPro();
        companyLicenseService.saveLicense(contractor.getCompany(), license);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping
    public ResponseEntity<Void> updateCompanyLicense(@PathVariable String companyId, @RequestBody @Valid CompanyLicense license) {
        Contractor contractor = userSecurityService.currentPro();
        companyLicenseService.saveLicense(contractor.getCompany(), license);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<CompanyLicense> getCompanyLicense(@PathVariable String companyId, @PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        CompanyLicense license = companyLicenseService.getLicense(contractor.getCompany(), id);
        return new ResponseEntity<>(license, HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteCompanyLicense(@PathVariable String companyId, @PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        companyLicenseService.deleteLicense(contractor.getCompany(), id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
