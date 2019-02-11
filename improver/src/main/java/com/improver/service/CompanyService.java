package com.improver.service;

import com.improver.entity.*;

import com.improver.exception.*;
import com.improver.model.CompanyInfo;
import com.improver.model.OfferedService;
import com.improver.model.ProNotificationSettings;
import com.improver.model.TradesServicesCollection;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.in.registration.CompanyDetails;
import com.improver.model.in.registration.CompanyRegistration;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.model.out.CompanyProfile;
import com.improver.model.out.ValidatedLocation;
import com.improver.model.out.project.ProjectRequestShort;
import com.improver.repository.*;
import com.improver.security.UserSecurityService;
import com.improver.util.mail.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.improver.util.TextMessages.REPLY_TEXT_TEMPLATE;

@Service
public class CompanyService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private UserSecurityService userSecurityService;
    @Autowired private UserService userService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private LocationService locationService;
    @Autowired private ImageService imageService;
    @Autowired private BillRepository billRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private BoundariesService boundariesService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private BillingService billingService;
    @Autowired private MailService mailService;

    public CompanyProfile getCompanyProfile(String id) {
        Company company = companyRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        Contractor current = userSecurityService.currentProOrNull();
        boolean isOwner = current != null && Objects.equals(current.getCompany().getId(), id);
        return new CompanyProfile(company, isOwner);
    }


    public TradesServicesCollection getCompanyTradesServicesCollection(Company company) {
        // 1. Trades
        List<NameIdTuple> offeredTrades = companyRepository.getOfferedTrades(company.getId());
        List<Long> tradeIds = offeredTrades.stream()
            .map(NameIdTuple::getId)
            .collect(Collectors.toList());

        // 2. Services with Trades
        List<NameIdParentTuple> selectedWithTrades;
        List<NameIdParentTuple> allServicesFromTrades;
        if (tradeIds.size() > 0) {
            selectedWithTrades = companyRepository.getSelectedByTrades(company.getId(), tradeIds);
            allServicesFromTrades = serviceTypeRepository.getByTradeIds(tradeIds);
        } else {
            selectedWithTrades = Collections.emptyList();
            allServicesFromTrades = Collections.emptyList();
        }

        List<OfferedService> offeredServices = allServicesFromTrades.stream()
            .map(service -> {
                boolean enabled = selectedWithTrades.contains(service);
                return new OfferedService(service.getId(), service.getName(), enabled, service.getParentId());
            })
            .collect(Collectors.toList());

        // 3. Other Services
        List<Long> serviceIds = selectedWithTrades.stream()
            .map(NameIdParentTuple::getId)
            .collect(Collectors.toList());
        List<NameIdTuple> other;
        if (serviceIds.isEmpty()) {
            other = companyRepository.getAll(company.getId());
        } else {
            other = companyRepository.getOther(company.getId(), serviceIds);
        }
        other.forEach(service -> offeredServices.add(new OfferedService(service.getId(), service.getName(), true, 0)));

        offeredServices.sort(Comparator.comparing(OfferedService::getName));
        return new TradesServicesCollection()
            .setTrades(offeredTrades)
            .setServices(offeredServices);
    }


    public void updateTradesServicesCollection(Company company, TradesServicesCollection tradesServicesCollection) {
        List<Long> tradeIds = tradesServicesCollection.getTrades().stream()
            .map(NameIdTuple::getId)
            .collect(Collectors.toList());
        List<Long> serviceIds = tradesServicesCollection.getServices().stream()
            .filter(OfferedService::isEnabled)
            .map(OfferedService::getId)
            .collect(Collectors.toList());
        List<Trade> trades = tradeRepository.findByIdIn(tradeIds);
        List<ServiceType> services = serviceTypeRepository.findByIdIn(serviceIds);
        companyRepository.save(company.setTrades(trades).setServiceTypes(services));
    }

    public void removeCompanyService(Company company, ServiceType toRemove) {
        List<Trade> companyTrades = company.getTrades();
        List<ServiceType> companyServices = company.getServiceTypes();
        companyServices.removeIf(serviceType -> serviceType.getId() == toRemove.getId());
        List<Trade> tradesToRemove = Collections.emptyList();

        //TODO: Misha finish this!!!
        // Remove trade if there are no more selected services
//        if (companyTrades.size() > 1){
//            Collections.copy(tradesToRemove, companyTrades);
//            tradesToRemove.retainAll(toRemove.getTrades());
//        }

        companyTrades.removeAll(tradesToRemove);
        companyRepository.save(company.setServiceTypes(companyServices).setTrades(companyTrades));
    }


    public void updateAreas(Company company, List<String> toAdd, List<String> toRemove) {
        List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
        toAdd.removeAll(toRemove);
        toAdd.removeAll(existed);

        areaRepository.updateAreasForCompany(company, toAdd, toRemove);
        log.info("Company={} Coverage: Added={} ; Removed={}", company.getId(), toAdd, toRemove);
    }


    private void updateAreas(Company company, List<String> toUpdate) {
        List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
        List<String> toAdd = new ArrayList<>(toUpdate);
        List<String> toRemove = new ArrayList<>(existed);
        toAdd.removeAll(existed);
        toRemove.removeAll(toUpdate);
        List<String> allServedZips = servedZipRepository.getAllServedZips();
        toAdd.removeIf(zip -> !allServedZips.contains(zip));
        areaRepository.updateAreasForCompany(company, toAdd, toRemove);
        log.info("Company={} Coverage: Added={} ; Removed={}", company.getId(), toAdd, toRemove);
    }

    public void addAreas(Company company, List<String> zipCodes) {
        if (zipCodes.size() > 1) {
            List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
            zipCodes.removeAll(existed);
        }
        List<Area> areas = zipCodes.stream().map(zip -> new Area().setZip(zip).setCompany(company))
            .collect(Collectors.toList());
        areaRepository.saveAll(areas);
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

    public void updateCompanyLocation(Company company, Location location) {
        ValidatedLocation result;
        try {
            result = locationService.validate(location, true, true);
            if (!result.isValid()) {
                throw new ValidationException(result.getError());
            }
        } catch (ThirdPartyException e) {
            throw new InternalServerException("Cannot complete Company Location updated due to 3rd party error", e);
        }
        companyRepository.updateCompanyLocation(company.getId(),
            location.getStreetAddress(),
            location.getCity(),
            location.getState(),
            location.getZip(),
            result.getSuggested().getLat(),
            result.getSuggested().getLng());

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

    public ProNotificationSettings getNotificationSettings(Company company, Contractor contractor) {

        return new ProNotificationSettings(company.getCompanyConfig().getNotificationSettings())
            .setQuickReply(contractor.isQuickReply())
            .setReplyText(contractor.getReplyText());

    }

    public void updateNotificationSettings(ProNotificationSettings notificationSettings, Company company, Contractor contractor) {
        CompanyConfig config = company.getCompanyConfig();
        config.getNotificationSettings()
            .setNewLeads(notificationSettings.isNewLeads())
            .setLeadReceipts(notificationSettings.isLeadReceipts())
            .setReceiveReviews(notificationSettings.isReceiveReviews())
            .setReceiveMarketing(notificationSettings.isReceiveMarketing())
            .setReceiveSuggestions(notificationSettings.isReceiveSuggestions());
        companyConfigRepository.save(config);
        contractorRepository.save(contractor.setQuickReply(notificationSettings.isQuickReply())
            .setReplyText(notificationSettings.getReplyText())
        );
    }

    private void updateCoverage(Company company, double lat, double lng, int radius) {
        List<String> zipCodes;
        try {
            zipCodes = boundariesService.getZipCodesInRadius(lat, lng, radius);
        } catch (ThirdPartyException e) {
            log.error("Error in request to Mapreflex API", e);
            throw new InternalServerException("Error in request to Mapreflex API. " + e.getMessage());
        }

        List<String> served = servedZipRepository.getAllServedZips();
        zipCodes.retainAll(served);

        updateAreas(company, zipCodes);
        CompanyConfig companyConfig = company.getCompanyConfig();
        CompanyConfig.CoverageConfig coverageConfig = companyConfig.getCoverageConfig();
        coverageConfig
            .setManualMode(false)
            .setRadius(radius);

        // fix for case if all coverage is in disabled area
        if (!zipCodes.isEmpty()) {
            coverageConfig
                .setCenterLat(lat)
                .setCenterLng(lng);
        } else {
            coverageConfig
                .setCenterLat(company.getLocation().getLat())
                .setCenterLng(company.getLocation().getLng());
        }

        companyConfigRepository.save(companyConfig);
    }

    public void updateCoverageConfig(CompanyConfig.CoverageConfig config, Company company, Contractor contractor) {
        if (config.isManualMode()) {
            updateAreas(company, config.getZips());
            CompanyConfig companyConfig = company.getCompanyConfig();
            companyConfig.getCoverageConfig().updateTo(config);
            companyConfigRepository.save(companyConfig);
        } else {
            updateCoverage(company, config.getCenterLat(), config.getCenterLng(), config.getRadius());
        }

    }

    public CompanyCoverageConfig getCoverageConfig(Company company, Contractor contractor) {
        CompanyConfig.CoverageConfig coverageConfig = company.getCompanyConfig().getCoverageConfig();
        coverageConfig.setZips(areaRepository.getZipCodesByCompanyId(company.getId()));
        return new CompanyCoverageConfig()
            .setCoverageConfig(coverageConfig)
            .setCompanyLocation(company.getLocation());
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
     * @param registration registration data for company
     * @param contractor company owner
     *
     */
    public void registerCompany(CompanyRegistration registration, Contractor contractor){
        // 1. Company
        Company company = createCompany(registration.getCompany(), contractor);

        // 2. Trades and Services
        updateTradesServicesCollection(company, registration.getTradesAndServices());

        // 3. Coverage
        updateCoverage(company, registration.getCoverage().getCenter().lat,
            registration.getCoverage().getCenter().lng, registration.getCoverage().getRadius());

        // 4. Add initial bonus from Invitation
        billingService.addInitialBonus(company, contractor.getEmail());

        // 5. send email to contractor
        mailService.sendRegistrationConfirmEmail(contractor);
    }


    @Deprecated
    private Company createCompany(CompanyDetails companyDetails, Contractor contractor) {
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
        String replyText = String.format(REPLY_TEXT_TEMPLATE, contractor.getDisplayName(), company.getName());
        if (contractor.isNativeUser()) {
            contractor.setActivated(false); //TODO: this is temporary to give ability for login and register company
        }
        contractorRepository.save(contractor.setCompany(company)
            .setQuickReply(true)
            .setReplyText(replyText));

        Billing billing = billRepository.save(Billing.forNewCompany(company));
        CompanyConfig defaultSettings = CompanyConfig.defaultSettings(company);
        company.setCompanyConfig(defaultSettings);
        company.setBilling(billing);
        companyConfigRepository.save(defaultSettings);
        return company;
    }

}
