package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.UnavailabilityPeriod;
import com.improver.exception.NotFoundException;
import com.improver.repository.CompanyRepository;
import com.improver.service.UnavailabilityPeriodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.improver.application.properties.Path.*;

@RestController
@RequestMapping(COMPANIES_PATH)
public class UnavailabilityPeriodController {

    @Autowired private UnavailabilityPeriodService unavailabilityPeriodService;
    @Autowired private CompanyRepository companyRepository;

    @GetMapping(COMPANY_ID + UNAVAILABILITIES)
    public ResponseEntity<List<UnavailabilityPeriod>> getUnavailabilityPeriod(@PathVariable String companyId) {
        Company company = companyRepository.findById(companyId).orElseThrow(NotFoundException::new);
        List<UnavailabilityPeriod> periods = unavailabilityPeriodService.getByCompany(company);
        return new ResponseEntity<>(periods, HttpStatus.OK);
    }

    @PostMapping(COMPANY_ID + UNAVAILABILITIES)
    public ResponseEntity<Void> addUnavailabilityPeriod(@PathVariable String companyId, @RequestBody UnavailabilityPeriod unavailabilityPeriod) {
        Company company = companyRepository.findById(companyId).orElseThrow(NotFoundException::new);
        unavailabilityPeriodService.addUnavailabilityPeriod(company, unavailabilityPeriod);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PutMapping(COMPANY_ID + UNAVAILABILITIES + ID_PATH_VARIABLE)
    public ResponseEntity<Void> updateUnavailabilityPeriod(@PathVariable Long id, @RequestBody UnavailabilityPeriod unavailabilityPeriod) {
        unavailabilityPeriodService.updateUnavailabilityPeriod(id, unavailabilityPeriod);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping(COMPANY_ID + UNAVAILABILITIES + ID_PATH_VARIABLE)
    public ResponseEntity<Void> deleteUnavailabilityPeriod(@PathVariable Long id) {
        unavailabilityPeriodService.deleteUnavailabilityPeriod(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
