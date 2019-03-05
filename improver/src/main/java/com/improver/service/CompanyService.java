package com.improver.service;

import com.improver.entity.*;

import com.improver.exception.*;
import com.improver.model.CompanyInfo;
import com.improver.model.in.registration.CompanyDetails;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.log4j.Log4j;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import javax.transaction.Transactional;
import java.time.ZonedDateTime;
import java.util.*;

import static com.improver.util.TextMessages.REPLY_TEXT_TEMPLATE;

@Slf4j
@Service
public class CompanyService {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private ImageService imageService;
    @Autowired private BillRepository billRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private BillingService billingService;
    @Autowired private MailService mailService;
    @Autowired private CompanyConfigService companyConfigService;


    public CompanyProfile getCompanyProfile(String id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        Contractor current = userSecurityService.currentProOrNull();
        boolean isOwner = current != null && Objects.equals(current.getCompany().getId(), id);
        return new CompanyProfile(company, isOwner);
    }




    public Page<Transaction> getTransactions(String companyId, Pageable pageable) {
        return transactionRepository.findByCompanyId(companyId, pageable);

    }

    public Page<ProjectRequestShort> getAllProject(String companyId, Pageable pageable) {
        return projectRepository.getCompanyProjects(companyId, pageable);
    }


    public Page<CompanyAction> getCompanyLogs(String companyId, Pageable pageable) {
        return companyRepository.getCompaniesLogs(companyId, pageable);
    }

    public CompanyInfo getCompanyInfo(String companyId) {
        return companyRepository.getCompanyInfo(companyId);
    }


    public void updateCompanyInfo(Company existed, CompanyInfo info) {
        existed.setFounded(info.getFounded())
            .setEmail(info.getEmail().toLowerCase())
            .setDescription(info.getDescription())
            .setUri(info.getUriName())
            .setSiteUrl(info.getSiteUrl())
            .setUpdated(ZonedDateTime.now());
        companyRepository.save(existed);
    }



    public void updateCompany(String companyId, Company company, String base64icon, MultipartFile coverImage) {
        Company existed = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if (userSecurityService.currentUser().getRole() == User.Role.ADMIN || userSecurityService.currentUser().getRole() == User.Role.SUPPORT) {
            existed.setName(company.getName());
            existed.setFounded(company.getFounded());
        }
        existed.setDescription(company.getDescription());
        existed.setUri(company.getUri());
        existed.setSiteUrl(company.getSiteUrl());
        existed.setEmail(company.getEmail().toLowerCase());
        String iconUrl = imageService.updateBase64Image(base64icon, existed.getIconUrl());
        existed.setIconUrl(iconUrl);
        if (coverImage != null) {
            if (existed.getBackgroundUrl() != null && !existed.getBackgroundUrl().isEmpty()) {
                imageService.silentDelete(existed.getBackgroundUrl());
            }
            String coverImageUrl = imageService.saveProjectImage(coverImage, null);
            existed.setBackgroundUrl(coverImageUrl);
        }
        companyRepository.save(existed);
    }


    public Page<Company> getCompanies(String id, Pageable pageable) {
        return companyRepository.getAllBy(id, pageable);
    }

    /**
     * Updates backgroundUrl for user. Previous backgroundUrl removes form database
     */
    public String updateBackground(String id, String imageInBase64) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String backgroundUrl = company.getBackgroundUrl();
        String imageUrl = imageService.updateBase64Image(imageInBase64, backgroundUrl);
        companyRepository.save(company.setBackgroundUrl(imageUrl));
        return imageUrl;
    }

    public String updateLogo(String id, String imageInBase64) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String logoUrl = company.getIconUrl();
        String imageUrl = imageService.updateBase64Image(imageInBase64, logoUrl);
        companyRepository.save(company.setIconUrl(imageUrl));
        return imageUrl;
    }

    public void deleteLogo(String id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = company.getIconUrl();
        imageService.silentDelete(imageUrl);
        companyRepository.save(company.setIconUrl(null));
    }

    public void deleteCover(String id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String coverUrl = company.getBackgroundUrl();
        imageService.silentDelete(coverUrl);
        companyRepository.save(company.setBackgroundUrl(null));
    }

    public boolean isEmailFree(String email) {
        return companyRepository.isEmailFree(email);
    }


    public void deleteCompany(Company company) {
        imageService.silentDelete(company.getIconUrl());
        company.setDeleted(true)
            .setIconUrl(null)
            .setTrades(Collections.emptyList())
            .setServiceTypes(Collections.emptyList());
        companyRepository.save(company);
        areaRepository.clearCoverageFor(company);
        Billing billing = company.getBilling();
        billing.getSubscription().reset();
        billRepository.save(billing);
        List<Contractor> pros = company.getContractors();
        userService.deleteContractors(pros);
    }

    /**
     * Performs registration of given company and links to given contractor
     *
     * @param registration registration data for company
     * @param contractor   company owner
     */
    @Transactional
    public void registerCompany(CompanyRegistration registration, Contractor contractor) {
        if (contractor.getCompany() != null) {
            throw new ConflictException(contractor.getCompany().getName() + " company already registered for "
                + contractor.getEmail());
        }

        Company company = createCompany(registration.getCompany());
        linkCompanyAndContractor(company, contractor);
        companyConfigService.updateTradesServicesCollection(company, registration.getTradesAndServices());
        CompanyConfig.CoverageConfig coverageConfig = company.getCompanyConfig().getCoverageConfig();
        coverageConfig.setCenterLat(registration.getCoverage().getCenter().lat)
            .setCenterLng(registration.getCoverage().getCenter().lng)
            .setRadius(registration.getCoverage().getRadius());
        companyConfigService.updateCoverageConfig(coverageConfig, company, contractor);
        // Add initial bonus from Invitation
        billingService.addInitialBonus(company, contractor.getEmail());
        if (contractor.isNativeUser()) {
            mailService.sendRegistrationConfirmEmail(contractor);
        }
    }


    private Company createCompany(CompanyDetails companyDetails) {
        ZonedDateTime now = ZonedDateTime.now();
        String iconUrl = null;
        if (companyDetails.getLogo() != null && !companyDetails.getLogo().isEmpty()) {
            try {
                iconUrl = imageService.saveBase64Image(companyDetails.getLogo());
            } catch (ValidationException | InternalServerException e) {
                log.warn("Could not save company logo", e);
            }
        }

        Company company = companyRepository.save(Company.of(companyDetails, iconUrl, now));
        Billing billing = billRepository.save(Billing.forNewCompany(company));
        CompanyConfig defaultSettings = CompanyConfig.defaultSettings(company);
        company.setCompanyConfig(defaultSettings);
        company.setBilling(billing);
        companyConfigRepository.save(defaultSettings);
        return company;
    }


    private void linkCompanyAndContractor(Company company, Contractor contractor) {
        String replyText = String.format(REPLY_TEXT_TEMPLATE, contractor.getDisplayName(), company.getName());
        contractorRepository.save(contractor.setCompany(company)
            .setIncomplete(false)
            .setQuickReply(true)
            .setReplyText(replyText));
    }

}
