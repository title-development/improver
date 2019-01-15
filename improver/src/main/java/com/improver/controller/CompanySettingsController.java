package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.CompanyConfig;
import com.improver.entity.Contractor;
import com.improver.entity.ExtendedLocation;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.ProNotificationSettings;
import com.improver.model.TradesServicesCollection;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.repository.AreaRepository;
import com.improver.repository.CompanyRepository;
import com.improver.security.UserSecurityService;
import com.improver.service.CompanyService;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import static com.improver.application.properties.Path.SERVICES;

@RestController
@RequestMapping(COMPANIES_PATH + COMPANY_ID)
public class CompanySettingsController {


    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private CompanyService companyService;
    @Autowired private AreaRepository areaRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;

    @CompanyMemberOrSupportAccess
    @GetMapping(SERVICES)
    public ResponseEntity<TradesServicesCollection> getCompanyTradesAndServices(@PathVariable String companyId) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        TradesServicesCollection companyTradesServicesCollection = companyService.getCompanyTradesServicesCollection(company);
        return new ResponseEntity<>(companyTradesServicesCollection, HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PutMapping(SERVICES)
    public ResponseEntity<Void> updateCompanyTradesAndServices(@PathVariable String companyId,
                                                               @RequestBody TradesServicesCollection tradesServicesCollection) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyService.updateTradesServicesCollection(company, tradesServicesCollection);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @CompanyMemberOrSupportAccess
    @PutMapping("/location")
    public ResponseEntity<Void> updateCompanyLocation(@PathVariable String companyId, @RequestBody ExtendedLocation location) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyService.updateCompanyLocation(company, location.withOutCoordinates());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping("/notifications")
    public ResponseEntity<ProNotificationSettings> getNotificationSettings(@PathVariable String companyId) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        ProNotificationSettings notificationSettings = companyService.getNotificationSettings(company, contractor);
        return new ResponseEntity<>( notificationSettings, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping("/notifications")
    public ResponseEntity<Void> updateNotificationSettings(@PathVariable String companyId,
                                                           @RequestBody ProNotificationSettings notificationSettings) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        companyService.updateNotificationSettings(notificationSettings, company, contractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }




    @CompanyMemberOrSupportAccess
    @PostMapping("/areas")
    @Deprecated
    public ResponseEntity<Void> addServiceArea(@PathVariable String companyId, @RequestBody List<String> zipCodes) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyService.addAreas(company, zipCodes);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @DeleteMapping("/areas")
    @Deprecated
    public ResponseEntity<Void> removeServiceArea(@PathVariable String companyId, @RequestBody List<String> zipCodes) {
        areaRepository.deleteZipCodesByCompanyId(companyId, zipCodes);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping("/areas")
    @Deprecated
    public ResponseEntity<Void> updateServiceArea(@PathVariable String companyId, @RequestParam List<String> toAdd, @RequestParam List<String> toRemove) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyService.updateAreas(company, toAdd, toRemove);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @GetMapping("/coverage")
    public ResponseEntity<CompanyCoverageConfig> getCoverageConfig(@PathVariable String companyId) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Contractor contractor = userSecurityService.currentPro();

        CompanyCoverageConfig coverageConfig = companyService.getCoverageConfig(company, contractor);

        return new ResponseEntity<>(coverageConfig, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping("/coverage")
    public ResponseEntity<Void> updateCoverageConfig(@PathVariable String companyId,
                                                     @RequestBody CompanyConfig.CoverageConfig coverageConfig) {

        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if(coverageConfig.isManualMode() && (coverageConfig.getZips() == null || coverageConfig.getZips().isEmpty())){
            throw new ValidationException("Zip codes not provided for manual coverage mode");
        }
        Contractor contractor = userSecurityService.currentPro();

        companyService.updateCoverageConfig(coverageConfig, company, contractor);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
