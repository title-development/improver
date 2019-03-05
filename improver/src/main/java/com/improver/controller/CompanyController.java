package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdTuple;
import com.improver.model.TradesServicesCollection;
import com.improver.model.in.CustomerReview;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.CompanyReview;
import com.improver.model.out.ReviewRating;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.ReviewRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.CompanyMember;
import com.improver.service.*;
import com.improver.repository.CompanyRepository;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.CompanyMemberOrSupportAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import javax.validation.constraints.Size;

import static com.improver.application.properties.Path.*;
import static com.improver.util.database.DataAccessUtil.REVIEW_MESSAGE_MAX_SIZE;
import static com.improver.util.database.DataAccessUtil.REVIEW_MESSAGE_MIN_SIZE;
import static com.improver.util.serializer.SerializationUtil.fromJson;

@Validated
@RestController
@RequestMapping(COMPANIES_PATH)
public class CompanyController {

    @Autowired private CompanyService companyService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private PasswordEncoder passwordEncoder;


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
        Contractor pro = userSecurityService.currentPro();
        if (!passwordEncoder.matches(password, pro.getPassword())) {
            throw new ValidationException("Password is not valid");
        }
        companyService.deleteCompany(pro.getCompany());
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
