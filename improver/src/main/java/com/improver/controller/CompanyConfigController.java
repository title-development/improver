package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.CompanyConfig;
import com.improver.entity.Contractor;
import com.improver.entity.ExtendedLocation;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.ProNotificationSettings;
import com.improver.model.TradesServicesCollection;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.repository.CompanyRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.CompanyMemberOrAdminAccess;
import com.improver.service.CompanyConfigService;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static com.improver.application.properties.Path.COMPANIES_PATH;
import static com.improver.application.properties.Path.COMPANY_ID;
import static com.improver.application.properties.Path.CONFIG;
import static com.improver.application.properties.Path.COVERAGE;
import static com.improver.application.properties.Path.LOCATIONS;
import static com.improver.application.properties.Path.SERVICES;
import static com.improver.application.properties.Path.NOTIFICATIONS;

@Slf4j
@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID + CONFIG)
public class CompanyConfigController {


    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private CompanyConfigService companyConfigService;

    @CompanyMemberOrAdminAccess
    @PutMapping(LOCATIONS)
    public ResponseEntity<Void> updateCompanyLocation(@PathVariable String companyId, @RequestBody ExtendedLocation location) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyConfigService.updateCompanyLocation(company, location.withOutCoordinates(), userSecurityService.currentAdminOrNull());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(NOTIFICATIONS)
    public ResponseEntity<ProNotificationSettings> getNotificationSettings(@PathVariable String companyId) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        ProNotificationSettings notificationSettings = companyConfigService.getNotificationSettings(company, contractor);
        return new ResponseEntity<>( notificationSettings, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(NOTIFICATIONS)
    public ResponseEntity<Void> updateNotificationSettings(@PathVariable String companyId,
                                                           @RequestBody ProNotificationSettings notificationSettings) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        companyConfigService.updateNotificationSettings(notificationSettings, company, contractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(COVERAGE)
    public ResponseEntity<CompanyCoverageConfig> getCoverageConfig(@PathVariable String companyId) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        CompanyCoverageConfig coverageConfig = companyConfigService.getCoverageConfig(company, contractor);

        return new ResponseEntity<>(coverageConfig, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(COVERAGE)
    public ResponseEntity<Void> updateCoverageConfig(@PathVariable String companyId,
                                                     @RequestBody CompanyConfig.CoverageConfig coverageConfig) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if(coverageConfig.isManualMode() && (coverageConfig.getZips() == null || coverageConfig.getZips().isEmpty())){
            throw new ValidationException("Zip codes not provided for manual coverage mode");
        }
        Contractor contractor = userSecurityService.currentPro();
        try {
            companyConfigService.updateCoverageConfig(coverageConfig, company, contractor);
        } catch (ThirdPartyException e) {
            throw new InternalServerException("Error in request to Mapreflex API. " + e.getMessage(), e);
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping(SERVICES)
    public ResponseEntity<TradesServicesCollection> getCompanyTradesAndServices(@PathVariable String companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        TradesServicesCollection companyTradesServicesCollection = companyConfigService.getCompanyTradesServicesCollection(company);
        return new ResponseEntity<>(companyTradesServicesCollection, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(SERVICES)
    public ResponseEntity<Void> updateCompanyTradesAndServices(@PathVariable String companyId,
                                                               @RequestBody TradesServicesCollection tradesServicesCollection) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyConfigService.updateTradesServicesCollection(company, tradesServicesCollection);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
