package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.InternalServerException;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.NameIdTuple;
import com.improver.model.OfferedService;
import com.improver.model.ProNotificationSettings;
import com.improver.model.TradesServicesCollection;
import com.improver.model.out.CompanyCoverageConfig;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.*;
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


    public void updateCoverageConfig(CompanyConfig.CoverageConfig config, Company company, Contractor contractor)   {
        if (config.isManualMode()) {
            updateAreas(company, config.getZips());
            CompanyConfig companyConfig = company.getCompanyConfig();
            companyConfig.getCoverageConfig().updateTo(config);
            companyConfigRepository.save(companyConfig);
        } else {
            updateCoverageByRadius(company, config.getCenterLat(), config.getCenterLng(), config.getRadius(), config.getZips());
        }

    }

    public void initCompanyCoverage(CompanyConfig.CoverageConfig config, Company company, Contractor contractor) {
        List<String> zipCodes = null;
        try {
            zipCodes = boundariesService.getZipCodesInRadius(config.getCenterLat(), config.getCenterLng(), config.getRadius());
        } catch (ThirdPartyException e) {
            zipCodes = Collections.emptyList();
            log.error("Could not update Company coverage for " + company.getName(), e);
        }
        updateCoverageByRadius(company, config.getCenterLat(), config.getCenterLng(), config.getRadius(), zipCodes);
    }

    private void updateCoverageByRadius(Company company, double lat, double lng, int radius, List<String> zipCodes)   {
        List<String> served = servedZipRepository.getAllServedZips();
        zipCodes.retainAll(served);
        updateAreas(company, zipCodes);
        CompanyConfig companyConfig = company.getCompanyConfig();
        CompanyConfig.CoverageConfig coverageConfig = companyConfig.getCoverageConfig();
        coverageConfig.setManualMode(false)
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
            .setReceiveNewLeads(notificationSettings.isReceiveNewLeads())
            .setReceiveMessages(notificationSettings.isReceiveMessages())
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
        List<NameIdTuple> offeredTrades = tradeRepository.getCompanyTrades(company.getId());
        List<Long> tradeIds = offeredTrades.stream()
            .map(NameIdTuple::getId)
            .collect(Collectors.toList());

        // 2. Services with Trades
        List<OfferedService> selectedWithTrades;
        List<OfferedService> allServicesFromTrades;
        if (!tradeIds.isEmpty()) {
            selectedWithTrades = serviceTypeRepository.getByCompanyAndTrades(company.getId(), tradeIds);
            allServicesFromTrades = serviceTypeRepository.getTradeServicesByIds(tradeIds);
        } else {
            selectedWithTrades = Collections.emptyList();
            allServicesFromTrades = Collections.emptyList();
        }

        List<OfferedService> offeredServices = allServicesFromTrades.stream()
            .map(service -> {
                boolean enabled = selectedWithTrades.contains(service);
                return service.setEnabled(enabled);
            })
            .collect(Collectors.toList());

        // 3. Other Services
        List<Long> serviceIds = selectedWithTrades.stream()
            .map(OfferedService::getId)
            .collect(Collectors.toList());
        List<OfferedService> otherServices;
        if (serviceIds.isEmpty()) {
            otherServices = serviceTypeRepository.getAllCompanyServices(company.getId());
        } else {
            otherServices = serviceTypeRepository.getCompanyServicesExcept(company.getId(), serviceIds);
        }
        otherServices.forEach(service -> offeredServices.add(service.setEnabled(true)));

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
            .filter(OfferedService::getEnabled)
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
        log.info("Company={} Coverage: Added={}; Removed={}", company.getId(), toAdd, toRemove);
    }

}
