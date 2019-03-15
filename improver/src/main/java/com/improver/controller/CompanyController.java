package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdTuple;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.security.UserSecurityService;
import com.improver.service.*;
import com.improver.repository.CompanyRepository;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import com.improver.security.annotation.SupportAccess;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.improver.application.properties.Path.*;
import static com.improver.util.serializer.SerializationUtil.fromJson;

@Validated
@RestController
@RequestMapping(COMPANIES_PATH)
public class CompanyController {

    @Autowired private CompanyService companyService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private AccountService accountService;


    @SupportAccess
    @GetMapping
    public ResponseEntity<Page<Company>> getCompanies(@RequestParam(required = false) String id,
                                                      @PageableDefault(sort = "name", direction = Sort.Direction.DESC) Pageable pageRequest) {

        Page<Company> companies = companyService.getCompanies(id, pageRequest);
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PutMapping(COMPANY_ID)
    public ResponseEntity<Void> update(@PathVariable String companyId,
                                       @RequestPart(value = "data") String data,
                                       @RequestPart(value = "icon", required = false) String base64icon,
                                       @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {
        Company company = fromJson(new TypeReference<Company>() {
        }, data);
        companyService.updateCompany(companyId, company, base64icon, coverImage);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    
    @PutMapping("/delete")
    public ResponseEntity<Void> delete(@RequestBody String password) {
        accountService.archiveAccountWithPassword(userSecurityService.currentPro(), password);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping(COMPANY_ID + "/logs")
    public ResponseEntity<Page<CompanyAction>> getLogs(@PathVariable String companyId,
                                                       @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<CompanyAction> companyLogs = this.companyService.getCompanyLogs(companyId, pageRequest);
        return new ResponseEntity<>(companyLogs, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping(COMPANY_ID + "/projects")
    public ResponseEntity<Page<ProjectRequestShort>> getAllProjects(@PathVariable String companyId,
                                                                    @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<ProjectRequestShort> project = companyService.getAllProject(companyId, pageRequest);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping(COMPANY_ID + SERVICES)
    public ResponseEntity<Page<NameIdTuple>> getCompanyServices(@PathVariable String companyId,
                                                                @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<NameIdTuple> services = companyRepository.getCompanyServices(companyId, pageRequest);

        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    @GetMapping(COMPANY_ID + "/info")
    public ResponseEntity<CompanyInfo> getCompanyInfo(@PathVariable String companyId) {
        CompanyInfo company = companyService.getCompanyInfo(companyId);
        return new ResponseEntity<>(company, HttpStatus.OK);
    }



    @GetMapping(IS_EMAIL_FREE)
    public ResponseEntity<Void> isEmailFree(@RequestParam("email") String email) {
        return new ResponseEntity<>(companyService.isEmailFree(email) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }

    @GetMapping(IS_NAME_FREE)
    public ResponseEntity<Void> isNameFree(@RequestParam("name") String name) {
        return new ResponseEntity<>(companyRepository.isNameFree(name) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }

    @SupportAccess
    @PostMapping(COMPANY_ID + "/approve")
    public ResponseEntity<Void> approve(@PathVariable String companyId, @RequestParam boolean approved) {
        companyRepository.approve(companyId, approved);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
