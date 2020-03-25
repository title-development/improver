package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ValidationException;
import com.improver.model.CompanyInfo;
import com.improver.model.admin.CompanyModel;
import com.improver.model.in.registration.CompanyDetails;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.billing.TransactionModel;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.Objects;

import static com.improver.util.TextMessages.REPLY_TEXT_TEMPLATE;

@Slf4j
@Service
public class CompanyService {

    @Autowired private UserSecurityService userSecurityService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private ImageService imageService;
    @Autowired private BillRepository billRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private StaffActionLogger staffActionLogger;


    public CompanyProfile getCompanyProfile(long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        Contractor owner = company.getContractors().get(0);
        Contractor current = userSecurityService.currentProOrNull();
        boolean isOwner = current != null && Objects.equals(owner.getId(), current.getId());
        return new CompanyProfile(company, owner, isOwner);
    }




    public Page<TransactionModel> getTransactions(long companyId, Pageable pageable, boolean adminView) {
        return transactionRepository.findByCompanyId(companyId, pageable)
            .map(transaction -> new TransactionModel(transaction, adminView));

    }

    public Page<ProjectRequestShort> getAllProject(long companyId, Pageable pageable) {
        return projectRepository.getCompanyProjects(companyId, pageable);
    }


    public Page<CompanyAction> getCompanyLogs(long companyId, Pageable pageable) {
        return companyRepository.getCompanyLogs(companyId, pageable);
    }

    public CompanyInfo getCompanyInfo(long companyId) {
        return companyRepository.getCompanyInfo(companyId);
    }


    public void updateCompanyInfo(Company existed, CompanyInfo info) {
        existed.setFounded(info.getFounded())
            .setSiteUrl(info.getSiteUrl() != null ? info.getSiteUrl().toLowerCase() : "")
            .setDescription(info.getDescription())
            .setUpdated(ZonedDateTime.now());
        companyRepository.save(existed);
    }



    public void updateCompany(long companyId, CompanyModel company, String base64icon, MultipartFile coverImage, Admin currentAdmin) {
        Company existed = companyRepository.findById(companyId)
            .orElseThrow(NotFoundException::new);
        if (userSecurityService.currentUser().getRole() == User.Role.ADMIN || userSecurityService.currentUser().getRole() == User.Role.SUPPORT) {
            existed.setName(company.getName());
            existed.setFounded(company.getFounded());
        }
        existed.setDescription(company.getDescription());
        existed.setSiteUrl(company.getSiteUrl());
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
        if (currentAdmin != null) {
            staffActionLogger.logCompanyUpdate(currentAdmin, existed);
        }

    }

    /**
     * Updates backgroundUrl for user. Previous backgroundUrl removes form database
     */
    public String updateBackground(long id, String imageInBase64) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String backgroundUrl = company.getBackgroundUrl();
        String imageUrl = imageService.updateBase64Image(imageInBase64, backgroundUrl);
        companyRepository.save(company.setBackgroundUrl(imageUrl));
        return imageUrl;
    }

    public String updateLogo(long id, String imageInBase64) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String logoUrl = company.getIconUrl();
        String imageUrl = imageService.updateBase64Image(imageInBase64, logoUrl);
        companyRepository.save(company.setIconUrl(imageUrl));
        return imageUrl;
    }

    public void deleteLogo(long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String imageUrl = company.getIconUrl();
        imageService.silentDelete(imageUrl);
        companyRepository.save(company.setIconUrl(null));
    }

    public void deleteCover(long id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        String coverUrl = company.getBackgroundUrl();
        imageService.silentDelete(coverUrl);
        companyRepository.save(company.setBackgroundUrl(null));
    }



    public void archiveCompany(Company company) {
        imageService.silentDelete(company.getIconUrl());
        company.setDeleted(true)
            .setUpdated(ZonedDateTime.now())
            .setIconUrl(null)
            .setTrades(Collections.emptyList())
            .setServiceTypes(Collections.emptyList());
        companyRepository.save(company);
        areaRepository.clearCoverageFor(company);
        Billing billing = company.getBilling();
        billing.getSubscription().reset();
        billRepository.save(billing);
    }

}
