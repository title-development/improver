package com.improver.controller;

import com.improver.entity.Company;
import com.improver.exception.NotFoundException;
import com.improver.model.CompanyInfo;
import com.improver.model.out.CompanyProfile;
import com.improver.repository.CompanyRepository;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import com.improver.service.CompanyService;
import groovy.util.logging.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.COMPANIES_PATH;
import static com.improver.application.properties.Path.COMPANY_ID;

@Slf4j
@Controller
@RequestMapping(COMPANIES_PATH)
public class CompanyProfileController {

    @Autowired
    private CompanyService companyService;
    @Autowired
    private CompanyRepository companyRepository;


    @GetMapping(COMPANY_ID + "/profile")
    public ResponseEntity<CompanyProfile> getCompanyProfile(@PathVariable String companyId) {
        CompanyProfile company = companyService.getCompanyProfile(companyId);
        return new ResponseEntity<>(company, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(COMPANY_ID + "/main")
    public ResponseEntity<Void> updateCompanyInfo(@PathVariable String companyId, @RequestBody CompanyInfo companyInfo) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        companyService.updateCompanyInfo(company, companyInfo);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PostMapping(COMPANY_ID + "/logo")
    public ResponseEntity<String> uploadLogoInBase64(@PathVariable String companyId, @RequestBody String imageInBase64) {
        String imageUrl = companyService.updateLogo(companyId, imageInBase64);

        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @DeleteMapping(COMPANY_ID + "/logo")
    public ResponseEntity<Void> deleteLogo(@PathVariable String companyId) {
        companyService.deleteLogo(companyId);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * Accepts image as BASE64 encoded data like "data:image/jpeg;base64,/9j/4AAQ...yD=="
     */
    @PostMapping(COMPANY_ID + "/cover")
    public ResponseEntity<String> uploadBackgroundInBase64(@PathVariable String companyId, @RequestBody String imageInBase64) {
        String imageUrl = companyService.updateBackground(companyId, imageInBase64);

        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @DeleteMapping(COMPANY_ID + "/cover")
    public ResponseEntity<Void> deleteCover(@PathVariable String companyId) {
        companyService.deleteCover(companyId);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
