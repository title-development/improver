package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.CompanyAction;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminContractor;
import com.improver.model.admin.CompanyModel;
import com.improver.model.admin.UserModel;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ContractorRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.CompanyMemberOrAdminAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.AccountService;
import com.improver.service.CompanyService;
import com.improver.util.annotation.PageableSwagger;
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

import java.util.List;

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
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private ContractorRepository contractorRepository;


    @SupportAccess
    @GetMapping
    public ResponseEntity<Page<CompanyModel>> getCompanies(@RequestParam(required = false) Long id,
                                                           @RequestParam(required = false) String name,
                                                           @RequestParam(required = false) String location,
                                                           @PageableDefault(sort = "name", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<CompanyModel> companies = companyRepository.findBy(id, name, location, pageRequest)
            .map(CompanyModel::new);
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @CompanyMemberOrAdminAccess
    @PutMapping(COMPANY_ID)
    public ResponseEntity<Void> update(@PathVariable long companyId,
                                       @RequestPart(value = "data") String data,
                                       @RequestPart(value = "icon", required = false) String base64icon,
                                       @RequestPart(value = "coverImage", required = false) MultipartFile coverImage) {
        CompanyModel company = fromJson(new TypeReference<>() {}, data);
        companyService.updateCompany(companyId, company, base64icon, coverImage, userSecurityService.currentAdminOrNull());
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
    public ResponseEntity<Page<CompanyAction>> getLogs(@PathVariable long companyId,
                                                       @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<CompanyAction> companyLogs = this.companyService.getCompanyLogs(companyId, pageRequest);
        return new ResponseEntity<>(companyLogs, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping(COMPANY_ID + "/projects")
    public ResponseEntity<Page<ProjectRequestShort>> getAllProjects(@PathVariable long companyId,
                                                                    @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<ProjectRequestShort> project = companyService.getAllProject(companyId, pageRequest);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @SupportAccess
    @PageableSwagger
    @GetMapping(COMPANY_ID + SERVICES)
    public ResponseEntity<Page<NameIdTuple>> getCompanyServices(@PathVariable long companyId,
                                                                @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<NameIdTuple> services = serviceTypeRepository.getCompanyServices(companyId, pageRequest);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    @GetMapping(COMPANY_ID + "/info")
    public ResponseEntity<CompanyInfo> getCompanyInfo(@PathVariable long companyId) {
        CompanyInfo company = companyService.getCompanyInfo(companyId);
        return new ResponseEntity<>(company, HttpStatus.OK);
    }


    @GetMapping(IS_NAME_FREE)
    public ResponseEntity<Void> isNameFree(@RequestParam("name") String name) {
        return new ResponseEntity<>(companyRepository.isNameFree(name) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }

    @SupportAccess
    @PostMapping(COMPANY_ID + "/approve")
    public ResponseEntity<Void> approve(@PathVariable long companyId,
                                        @RequestParam boolean isApproved) {

        companyRepository.approve(companyId, isApproved);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @GetMapping(COMPANY_ID + CONTRACTORS)
    public ResponseEntity<List<UserModel>> getContractors(@RequestParam(required = false) Long id) {
        List<UserModel> contractors = contractorRepository.findByCompanyId(id);
        return new ResponseEntity<>(contractors, HttpStatus.OK);
    }

}
