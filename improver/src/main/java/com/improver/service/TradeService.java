package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.NameIdTuple;
import com.improver.model.NameIdParentTuple;
import com.improver.model.admin.AdminTrade;
import com.improver.model.out.TradeAndServices;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.TradeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Mykhailo Soltys
 */
@Slf4j
@Service
public class TradeService {

    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private ImageService imageService;
    @Autowired private CompanyRepository companyRepository;

    public List<NameIdTuple> getAllTradesModel() {
        return tradeRepository.getAllAsModels();
    }

    public Page<AdminTrade> getAllTrades(Long id, String name, String description, Integer ratingFrom, Integer ratingTo, Pageable pageRequest) {
        Page<AdminTrade> trades = tradeRepository.getAll(id, name, description, ratingFrom, ratingTo, pageRequest)
            .map(trade -> trade.setServices(serviceTypeRepository.getByTradeId(trade.getId())));
        return trades;
    }

    public List<NameIdTuple> getActiveServicesForTrade(long id) {
        return serviceTypeRepository.getActiveByTradeId(id);
    }

    public List<TradeAndServices> getAllTradesAndServices() {
        List<NameIdTuple> trades = tradeRepository.getAllAsModels();
        List<Long> tradeIds = trades.stream()
            .map(NameIdTuple::getId)
            .collect(Collectors.toList());

        List<NameIdParentTuple> services = serviceTypeRepository.getActiveByTradeIds(tradeIds);

        return trades.stream()
            .map(trade -> {
                List<NameIdTuple> servicesOfTrade = services.stream()
                    .filter(nameIdParentTuple -> nameIdParentTuple.getParentId() == trade.getId())
                    .map(nameIdParentTuple -> new NameIdTuple(nameIdParentTuple.getId(), nameIdParentTuple.getName()))
                    .collect(Collectors.toList());
                return new TradeAndServices(trade.getId(), trade.getName(), servicesOfTrade);
            })
            .collect(Collectors.toList());
    }

    public AdminTrade getTradeById(long id) {
        Trade trade = tradeRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        List<NameIdTuple> serviceTypes = serviceTypeRepository.getByTradeId(trade.getId());

        return new AdminTrade(trade, serviceTypes);
    }

    public void updateTrade(long id, AdminTrade adminTrade, MultipartFile file) {
        Trade existedTrade = tradeRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        String newImageUrl;
        if (file != null) {
            newImageUrl = imageService.updateImage(file, existedTrade.getImageUrl());
        } else if ((existedTrade.getImageUrl() != null && !existedTrade.getImageUrl().isEmpty())
            && (adminTrade.getImageUrl() == null || adminTrade.getImageUrl().isEmpty())) {
            imageService.silentDelete(existedTrade.getImageUrl());
            newImageUrl = null;
        } else {
            newImageUrl = adminTrade.getImageUrl();
        }

        if (!tradeRepository.isTradeNameFree(adminTrade.getName()) && !existedTrade.getName().equals(adminTrade.getName())) {
            throw new ConflictException("Trade with name " + adminTrade.getName() + " already exist");
        }

        List<Long> serviceTypeIds = adminTrade.getServices().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<ServiceType> serviceTypes = serviceTypeRepository.findByIdIn(serviceTypeIds);

        existedTrade.setName(adminTrade.getName());
        existedTrade.setDescription(adminTrade.getDescription());
        existedTrade.setRating(adminTrade.getRating());
        existedTrade.setServiceTypes(serviceTypes);
        existedTrade.setImageUrl(newImageUrl);

        tradeRepository.save(existedTrade);
    }

    public void addTrade(AdminTrade adminTrade, MultipartFile file) {
        if (!tradeRepository.isTradeNameFree(adminTrade.getName())) {
            throw new ConflictException("Trade with name " + adminTrade.getName() + " already exist");
        }

        List<Long> serviceTypesIds = adminTrade.getServices().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<ServiceType> serviceTypes = serviceTypeRepository.findByIdIn(serviceTypesIds);
        String imageUrl = file != null ? imageService.saveImage(file) : null;

        Trade trade = new Trade(adminTrade, imageUrl, serviceTypes);

        tradeRepository.save(trade);
    }

    public void deleteTrade(long id) {
        Trade trade = tradeRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        String imageUrl = trade.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            imageService.silentDelete(imageUrl);
        }

        if (companyRepository.existsByTradesId(id)) {
            throw new ConflictException("Some Companies use this trade");
        }

        trade.getServiceTypes().forEach(serviceType -> serviceType.removeTradeById(trade.getId()));

        tradeRepository.delete(trade);
    }


    public boolean isNameFree(String tradeName) {
        return tradeRepository.isTradeNameFree(tradeName);
    }
}
