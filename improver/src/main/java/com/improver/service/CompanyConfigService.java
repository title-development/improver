package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.OfferedService;
import com.improver.model.ProNotificationSettings;
import com.improver.model.TradesServicesCollection;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.AreaRepository;
import com.improver.repository.CompanyConfigRepository;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ContractorRepository;
import com.improver.repository.ServedZipRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.TradeRepository;
import com.improver.util.StaffActionLogger;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class CompanyConfigService {

    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private AreaRepository areaRepository;
    @Autowired private LocationService locationService;
    @Autowired private CompanyConfigRepository companyConfigRepository;
    @Autowired private ContractorRepository contractorRepository;
    @Autowired private BoundariesService boundariesService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private StaffActionLogger staffActionLogger;


    public void updateCoverageConfig(CompanyConfig.CoverageConfig config, Company company, Contractor contractor) {
        if (config.isManualMode()) {
            updateAreas(company, config.getZips());
            CompanyConfig companyConfig = company.getCompanyConfig();
            companyConfig.getCoverageConfig().updateTo(config);
            companyConfigRepository.save(companyConfig);
        } else {
            updateCoverageByRadius(company, config.getCenterLat(), config.getCenterLng(), config.getRadius());
        }

    }

    private void updateCoverageByRadius(Company company, double lat, double lng, int radius) {
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

    public CompanyCoverageConfig getCoverageConfig(Company company, Contractor contractor) {
        CompanyConfig.CoverageConfig coverageConfig = company.getCompanyConfig().getCoverageConfig();
        coverageConfig.setZips(areaRepository.getZipCodesByCompanyId(company.getId()));
        return new CompanyCoverageConfig()
            .setCoverageConfig(coverageConfig)
            .setCompanyLocation(company.getLocation());
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


    public void updateCompanyLocation(Company company, Location location, Admin currentAdmin) {
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
        if (currentAdmin != null) {
            staffActionLogger.logCompanyUpdate(currentAdmin, company);
        }
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


    private void updateAreas(Company company, List<String> toUpdate) {
        List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
        List<String> toAdd = new ArrayList<>(toUpdate);
        List<String> toRemove = new ArrayList<>(existed);
        toAdd.removeAll(existed);
        toRemove.removeAll(toUpdate);
        List<String> allServedZips = servedZipRepository.getAllServedZips();
        toAdd.removeIf(zip -> !allServedZips.contains(zip));
        areaRepository.updateAreasForCompany(company, toAdd, toRemove);
        log.debug("Company={} Coverage: Added={}; Removed={}", company.getId(), toAdd, toRemove);
    }


    @Deprecated
    public void updateAreas(Company company, List<String> toAdd, List<String> toRemove) {
        List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
        toAdd.removeAll(toRemove);
        toAdd.removeAll(existed);

        areaRepository.updateAreasForCompany(company, toAdd, toRemove);
        log.debug("Company={} Coverage: Added={} ; Removed={}", company.getId(), toAdd, toRemove);
    }

    @Deprecated
    public void addAreas(Company company, List<String> zipCodes) {
        if (zipCodes.size() > 1) {
            List<String> existed = areaRepository.getZipCodesByCompanyId(company.getId());
            zipCodes.removeAll(existed);
        }
        List<Area> areas = zipCodes.stream().map(zip -> new Area().setZip(zip).setCompany(company))
            .collect(Collectors.toList());
        areaRepository.saveAll(areas);
    }

    @Deprecated
    public void deleteZipCodesByCompanyId(String companyId, List<String> zipCodes) {
        areaRepository.deleteZipCodesByCompanyId(companyId, zipCodes);
    }
}
