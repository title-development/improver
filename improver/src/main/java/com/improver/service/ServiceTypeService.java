package com.improver.service;

import com.improver.entity.ServiceType;
import com.improver.entity.Trade;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminServiceType;
import com.improver.model.out.NameIdImageTuple;
import com.improver.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ServiceTypeService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ImageService imageService;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private QuestionaryRepository questionaryRepository;

    /**
     * Returns list with given <code>size</code> of most popular {@link NameIdImageTuple}
     */
    public List<NameIdImageTuple> getPopularServices(int size) {
        return serviceTypeRepository.getPopularAsModels(PageRequest.of(0, size))
            .getContent();
    }

    /**
     * Returns list with given <code>size</code> of random {@link NameIdImageTuple} generated from {@link ServiceType}
     */
    public List<NameIdImageTuple> getRandomAsModels(int size) {
        return serviceTypeRepository.getRandomWithImageAsModels(PageRequest.of(0, size))
            .getContent();
    }

    public List<NameIdTuple> getAllServicesModel() {
        return serviceTypeRepository.getAllAsModels();
    }

    /**
     * sorted[0] ServiceTypes without Questionary
     * sorted[1] ServiceTypes with Questionary
     *
     * @return sorted
     */
    public List<List<NameIdTuple>> getSortedByQuestionaryExist() {
        List<List<NameIdTuple>> sorted = new ArrayList<>();
        sorted.add(serviceTypeRepository.getAllWithOutQuestionary());
        sorted.add(serviceTypeRepository.getAllWithQuestionaryTupple());

        return sorted;
    }

    public Page<AdminServiceType> getAllServiceTypes(Long id, String name, String description, String labels, String tradeName, Integer ratingFrom, Integer ratingTo, Integer leadPriceFrom, Integer leadPriceTo, Pageable pageable) {
        name = name != null ? name.toLowerCase() : name;
        labels = labels != null ? labels.toLowerCase() : labels;
        description = description != null ? description.toLowerCase() : description;
        tradeName = tradeName != null ? tradeName.toLowerCase() : tradeName;

        Page<AdminServiceType> serviceTypes = serviceTypeRepository.getAll(id, name, description, labels, tradeName, ratingFrom, ratingTo, leadPriceFrom, leadPriceTo, pageable)
            .map(adminServiceType -> adminServiceType.setTrades(tradeRepository.getByServiceTypeId(adminServiceType.getId())));

        return serviceTypes;
    }

    public AdminServiceType getServiceTypeById(long id) {
        AdminServiceType adminServiceType = serviceTypeRepository.getById(id)
            .orElseThrow(NotFoundException::new);
        adminServiceType.setTrades(tradeRepository.getByServiceTypeId(adminServiceType.getId()));

        return adminServiceType;
    }

    public void updateServiceType(long id, AdminServiceType adminServiceType, MultipartFile file) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        String newImageUrl;
        if (file != null) {
            newImageUrl = imageService.updateImage(file, serviceType.getImageUrl());
        } else if ((serviceType.getImageUrl() != null && !serviceType.getImageUrl().isEmpty())
            && (adminServiceType.getImageUrl() == null || adminServiceType.getImageUrl().isEmpty())) {
            imageService.silentDelete(serviceType.getImageUrl());
            newImageUrl = null;
        } else {
            newImageUrl = adminServiceType.getImageUrl();
        }

        if (!serviceTypeRepository.isServiceNameFree(adminServiceType.getName()) && !serviceType.getName().equals(adminServiceType.getName())) {
            throw new ConflictException("Service Type with name " + adminServiceType.getName() + " already exist");
        }

        if (adminServiceType.getTrades().isEmpty()) {
            throw new ConflictException("Please select at least one trade");
        }
        if (adminServiceType.getLeadPrice() <= 0) {
            throw new ConflictException("Please enter a positive lead price");
        }

        List<Long> tradeIds = adminServiceType.getTrades().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<Trade> trades = tradeRepository.findByIdIn(tradeIds);

        serviceType.setName(adminServiceType.getName());
        serviceType.setDescription(adminServiceType.getDescription());
        serviceType.setActive(adminServiceType.isActive());
        serviceType.setRating(adminServiceType.getRating());
        serviceType.setLabels(adminServiceType.getLabels());
        serviceType.setLeadPrice(adminServiceType.getLeadPrice());
        serviceType.setImageUrl(newImageUrl);
        serviceType.updateTrades(trades);

        serviceTypeRepository.save(serviceType);
    }

    public void addServiceType(AdminServiceType adminServiceType, MultipartFile file) {
        if (!serviceTypeRepository.isServiceNameFree(adminServiceType.getName())) {
            throw new ConflictException("Service Type with name " + adminServiceType.getName() + " already exist");
        }
        if (adminServiceType.getTrades().isEmpty()) {
            throw new ConflictException("Please select at least one trade");
        }
        if (adminServiceType.getLeadPrice() <= 0) {
            throw new ConflictException("Please enter a positive lead price");
        }

        List<Long> tradeIds = adminServiceType.getTrades().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<Trade> trades = tradeRepository.findByIdIn(tradeIds);
        String imageUrl = file != null ? imageService.saveImage(file) : null;

        ServiceType serviceType = new ServiceType(adminServiceType, trades, imageUrl);

        serviceTypeRepository.save(serviceType);

    }

    public void deleteServiceType(long id) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        if (projectRepository.existsByServiceTypeId(id)) {
            throw new ConflictException("Some project use this service type");
        }

        if (companyRepository.existsByServiceTypesId(id)) {
            throw new ConflictException("Some Company use this service type");
        }

        if (questionaryRepository.existsByServiceTypesId(id)) {
            throw new ConflictException("Some questionary use this service type");
        }

        String imageUrl = serviceType.getImageUrl();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            imageService.silentDelete(imageUrl);
        }

        serviceType.getTrades().forEach(trade -> trade.removeServiceTypeById(id));

        serviceTypeRepository.delete(serviceType);
    }

    public boolean isNameFree(String serviceName) {
        return serviceTypeRepository.isServiceNameFree(serviceName);
    }
}

