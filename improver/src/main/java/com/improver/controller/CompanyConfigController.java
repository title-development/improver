package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.CompanyConfig;
import com.improver.entity.Contractor;
import com.improver.entity.ExtendedLocation;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.TradesServicesCollection;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.repository.CompanyRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.CompanyMemberOrAdminAccess;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import com.improver.service.AccountService;
import com.improver.service.CompanyConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.*;

@Slf4j
@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + CONFIG)
public class CompanyConfigController {


    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private CompanyConfigService companyConfigService;
    @Autowired private AccountService accountService;

    @CompanyMemberOrAdminAccess
    @PutMapping(LOCATIONS)
    public ResponseEntity<Void> updateCompanyLocation(@PathVariable long companyId, @RequestBody ExtendedLocation location) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyConfigService.updateCompanyLocation(company, location.withOutCoordinates(), userSecurityService.currentAdminOrNull());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(NOTIFICATIONS)
    public ResponseEntity<Contractor.NotificationSettings> getNotificationSettings(@PathVariable long companyId) {
        Contractor contractor = userSecurityService.currentPro();
        Contractor.NotificationSettings notificationSettings = contractor.getNotificationSettings();
        return new ResponseEntity<>(notificationSettings, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(NOTIFICATIONS)
    public ResponseEntity<Void> updateNotificationSettings(@PathVariable long companyId,
                                                           @RequestBody Contractor.NotificationSettings notificationSettings) {
        Contractor contractor = userSecurityService.currentPro();
        accountService.updateContractorNotificationSettings(contractor, notificationSettings);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(COVERAGE)
    public ResponseEntity<CompanyCoverageConfig> getCoverageConfig(@PathVariable long companyId) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        CompanyCoverageConfig coverageConfig = companyConfigService.getCoverageConfig(company, contractor);

        return new ResponseEntity<>(coverageConfig, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(COVERAGE)
    public ResponseEntity<Void> updateCoverageConfig(@PathVariable long companyId,
                                                     @RequestBody CompanyConfig.CoverageConfig coverageConfig) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if (coverageConfig.isManualMode() && (coverageConfig.getZips() == null || coverageConfig.getZips().isEmpty())) {
            throw new ValidationException("Zip codes not provided for manual coverage mode");
        }
        Contractor contractor = userSecurityService.currentPro();
        companyConfigService.updateCoverageConfig(coverageConfig, company, contractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(SERVICES)
    public ResponseEntity<TradesServicesCollection> getCompanyTradesAndServices(@PathVariable long companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        TradesServicesCollection companyTradesServicesCollection = companyConfigService.getCompanyTradesServicesCollection(company);
        return new ResponseEntity<>(companyTradesServicesCollection, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(SERVICES)
    public ResponseEntity<Void> updateCompanyTradesAndServices(@PathVariable long companyId,
                                                               @RequestBody TradesServicesCollection tradesServicesCollection) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyConfigService.updateTradesServicesCollection(company, tradesServicesCollection);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
