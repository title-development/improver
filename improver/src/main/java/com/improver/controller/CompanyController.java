package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.*;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.CompanyInfo;
import com.improver.model.NameIdTuple;
import com.improver.model.in.CustomerReview;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.CompanyReview;
import com.improver.model.out.ReviewRating;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.ReviewRepository;
import com.improver.security.UserSecurityService;
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

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private CompanyService companyService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private ReviewService reviewService;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private MailService mailService;
    @Autowired private ImageController imageController;
    @Autowired private PasswordEncoder passwordEncoder;


    @SupportAccess
    @GetMapping
    public ResponseEntity<Page<Company>> getCompanies(@RequestParam(required = false) String id,
                                                      @PageableDefault(sort = "name", direction = Sort.Direction.DESC) Pageable pageRequest) {

        Page<Company> companies = companyService.getCompanies(id, pageRequest);
        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @GetMapping(COMPANY_ID + ICON)
    public ResponseEntity<Resource> getCompanyIcon(@PathVariable String companyId) {
        String iconUrl = companyRepository.getIconUrl(companyId)
            .orElseThrow(NotFoundException::new);
        return imageController.getImageByURL(iconUrl);
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

    @PostMapping(REGISTER)
    public ResponseEntity<Void> register(@RequestBody Company company) {
        Company saved = companyRepository.save(company);
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
    @GetMapping(COMPANY_ID + "/offered-services")
    public ResponseEntity<Page<NameIdTuple>> getOfferedServices(@PathVariable String companyId,
                                                                @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Page<NameIdTuple> services = companyRepository.getOfferedServices(companyId, pageRequest);

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


    /**
     * Accepts image as BASE64 encoded data like "data:image/jpeg;base64,/9j/4AAQ...yD=="
     */
    @PostMapping(COMPANY_ID + "/base64background")
    public ResponseEntity<String> uploadBackgroundInBase64(@PathVariable String companyId, @RequestBody String imageInBase64) {
        String imageUrl = companyService.updateBackground(companyId, imageInBase64);

        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @PostMapping(COMPANY_ID + "/base64logo")
    public ResponseEntity<String> uploadLogoInBase64(@PathVariable String companyId, @RequestBody String imageInBase64) {
        String imageUrl = companyService.updateLogo(companyId, imageInBase64);

        return new ResponseEntity<>(imageUrl, HttpStatus.OK);
    }

    @DeleteMapping(COMPANY_ID + "/base64logo")
    public ResponseEntity<Void> deleteLogo(@PathVariable String companyId) {
        companyService.deleteLogo(companyId);

        return new ResponseEntity<>(HttpStatus.OK);
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


    @PageableSwagger
    @GetMapping(COMPANY_ID + REVIEWS)
    public ResponseEntity<ReviewRating> getCompanyReviews(@PathVariable String companyId, @RequestParam(defaultValue = "false") boolean publishedOnly,
                                                          @PageableDefault(sort = "created", direction = Sort.Direction.DESC) Pageable pageRequest) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Page<CompanyReview> reviewsPage = reviewService.getReviews(companyId, publishedOnly, pageRequest);
        ReviewRating reviewRating = new ReviewRating(company.getRating(), reviewsPage);
        return new ResponseEntity<>(reviewRating, HttpStatus.OK);
    }

    @CompanyMemberOrSupportAccess
    @PostMapping(COMPANY_ID + REVIEWS + ID_PATH_VARIABLE + "/revision")
    public ResponseEntity<Void> requestReviewRevision(@PathVariable String companyId,
                                                      @PathVariable Long id,
                                                      @RequestBody
                                                      @Size(min = REVIEW_MESSAGE_MIN_SIZE, max = REVIEW_MESSAGE_MAX_SIZE,
                                                      message = "Message should be "+ REVIEW_MESSAGE_MIN_SIZE +" to "+ REVIEW_MESSAGE_MAX_SIZE +" characters long.")
                                                              String comment) {
        Company company = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        Review review = reviewRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        reviewService.requestReviewRevision(company, review, comment);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping(COMPANY_ID + REVIEWS + "/options")
    public ResponseEntity<Void> getReviewCapability(@PathVariable String companyId,
                                                    @RequestParam(defaultValue = "0") long projectRequestId,
                                                    @RequestParam(required = false) String reviewToken) {

        Customer customer = userSecurityService.currentCustomer();
        reviewService.checkReview(projectRequestId, customer, companyId, reviewToken);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping(COMPANY_ID + REVIEWS)
    public ResponseEntity<Void> addReview(@PathVariable String companyId,
                                          @RequestParam(defaultValue = "0") long projectRequestId,
                                          @RequestParam(required = false) String reviewToken,
                                          @RequestBody @Valid CustomerReview review) {

        Customer customer = userSecurityService.currentCustomer();
        Review companyReview = reviewService.checkReview(projectRequestId, customer, companyId, reviewToken);
        reviewService.addReview(companyReview.setScore(review.getScore()).setDescription(review.getDescription()), reviewToken, customer);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @SupportAccess
    @PostMapping(COMPANY_ID)
    public ResponseEntity<Void> approve(@PathVariable String companyId, @RequestParam boolean approved) {
        companyRepository.approve(companyId, approved);
        return new ResponseEntity<>(HttpStatus.OK);
    }


}
