package com.improver.controller;

import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.model.out.project.Lead;
import com.improver.model.out.project.ShortLead;
import com.improver.security.UserSecurityService;
import com.improver.service.LeadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.LEADS_PATH;


@RestController
@RequestMapping(LEADS_PATH)
public class LeadController {

    @Autowired private LeadService leadService;
    @Autowired private UserSecurityService userSecurityService;



    @GetMapping
    public ResponseEntity<Page<ShortLead>> getProLeads(
        @RequestParam  (required = false) boolean inCoverageOnly,
        @RequestParam (required = false) double[] southWest,
        @RequestParam (required = false) double[] northEast,
        @RequestParam(required = false) String searchTerm,
        @PageableDefault(sort = "created", page = 0, size = 5, direction = Sort.Direction.DESC) Pageable pageRequest) {

        Page<ShortLead> leads = leadService.getLeads(userSecurityService.currentPro(), true, inCoverageOnly, searchTerm, southWest, northEast, pageRequest);
        return new ResponseEntity<>(leads, HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE + "/similar")
    public ResponseEntity<List<ShortLead>> getSimilarLeads(@PathVariable long id) {
        List<ShortLead> leads;
        Contractor contractor = userSecurityService.currentPro();
        leads = leadService.getSimilarLeads(id, contractor);
        return new ResponseEntity<>(leads, HttpStatus.OK);
    }



    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<Lead> getLead(@PathVariable long id) {
        Contractor contractor = userSecurityService.currentPro();
        Company company = contractor.getCompany();
        Lead lead = leadService.getLead(id, company);
        return new ResponseEntity<>(lead, HttpStatus.OK);
    }


    @PostMapping(ID_PATH_VARIABLE + "/purchase")
    public ResponseEntity<Long> purchaseLead(@PathVariable long id, @RequestParam boolean fromCard) {
        Contractor contractor = userSecurityService.currentPro();
        long projectRequestId = leadService.manualLeadPurchase(id, contractor, fromCard);
        return new ResponseEntity<>(projectRequestId, HttpStatus.OK);
    }
}
