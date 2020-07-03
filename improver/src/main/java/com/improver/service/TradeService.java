package com.improver.service;

import com.improver.entity.ServiceType;
import com.improver.entity.Trade;
import com.improver.exception.ConflictException;
import com.improver.exception.NotFoundException;
import com.improver.model.NameIdParentTuple;
import com.improver.model.NameIdTuple;
import com.improver.model.admin.AdminTrade;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.TradeAndServices;
import com.improver.model.out.TradeModel;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.TradeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.application.properties.SystemProperties.tradesCacheDurations;

/**
 * @author Mykhailo Soltys
 */
@Slf4j
@Service
public class TradeService {

    private static final int MAX_IMAGES_COUNT = 5;
    private ZonedDateTime tradesCacheExpirationTime;
    private List<TradeModel> suggestedTradesWithServices;
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

    public void updateTrade(long id, AdminTrade adminTrade) {
        Trade existedTrade = tradeRepository.findById(id)
            .orElseThrow(NotFoundException::new);

        if (!tradeRepository.isTradeNameFree(adminTrade.getName()) && !existedTrade.getName().equals(adminTrade.getName())) {
            throw new ConflictException("Trade with name " + adminTrade.getName() + " already exist");
        }

        List<Long> serviceTypeIds = adminTrade.getServices().stream().map(NameIdTuple::getId).collect(Collectors.toList());
        List<ServiceType> serviceTypes = serviceTypeRepository.findByIdIn(serviceTypeIds);

        existedTrade.setName(adminTrade.getName());
        existedTrade.setDescription(adminTrade.getDescription());
        existedTrade.setRating(adminTrade.getRating());
        existedTrade.setServiceTypes(serviceTypes);
        existedTrade.setImageUrls(String.join(",", adminTrade.getImageUrls()));
        existedTrade.setAdvertised(adminTrade.getIsAdvertised());

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

        String imageUrl = trade.getImageUrls();
        if (imageUrl != null && !imageUrl.isEmpty()) {
            imageService.silentDelete(imageUrl);
        }

        if (companyRepository.existsByTradesId(id)) {
            throw new ConflictException("Some Companies use this trade");
        }

        trade.getServiceTypes().forEach(serviceType -> serviceType.removeTradeById(trade.getId()));

        tradeRepository.delete(trade);
    }

    private void addTradesCacheExpiredTime() {
        this.tradesCacheExpirationTime = ZonedDateTime.now().plus(tradesCacheDurations);
    }

    public List<TradeModel> getCachedTrades() {
        ZonedDateTime now = ZonedDateTime.now();
        if (this.tradesCacheExpirationTime == null || now.isAfter(this.tradesCacheExpirationTime)) {
            this.suggestedTradesWithServices = getSuggestedTradeWithServices();
            addTradesCacheExpiredTime();
        }
        return this.suggestedTradesWithServices;
    }

    private List<TradeModel> getSuggestedTradeWithServices(){
        List<NameIdParentTuple> allSuggestedService = serviceTypeRepository.getSuggestedServices();
        List<NameIdImageTuple> allSuggestedTrades = tradeRepository.getSuggestedTrades();

        return allSuggestedTrades.stream()
             .map( trade -> {
                 List<NameIdTuple> tradeSuggestedServices = allSuggestedService.stream()
                     .filter(suggestedService -> suggestedService.getParentId() == trade.getId())
                     .map(suggestedService -> new NameIdTuple(suggestedService.getId(), suggestedService.getName()))
                     .collect(Collectors.toList());

                     return new TradeModel()
                             .setId(trade.getId())
                             .setName(trade.getName())
                             .setImage(trade.getImage())
                             .setServices(tradeSuggestedServices);

             }).collect(Collectors.toList());
    }


    public boolean isNameFree(String tradeName) {
        return tradeRepository.isTradeNameFree(tradeName);
    }

    public List<String> updateTradeImages(long tradeId, int index, MultipartFile image) {

        Trade trade = tradeRepository.findById(tradeId)
                                     .orElseThrow(NotFoundException::new);
        List<String> imageUrls = trade.getImageUrlsFromString();
        if (imageUrls.size() >= MAX_IMAGES_COUNT && index > imageUrls.size() - 1){
            throw new IllegalArgumentException("Max slider size " + MAX_IMAGES_COUNT);
        }
        String newImageUrl = image != null ? imageService.saveImage(image) : null;
        if (newImageUrl != null && (imageUrls.isEmpty() || index > imageUrls.size() - 1)) {
            imageUrls.add(newImageUrl);
        } else {
            String imageUrl = imageUrls.get(index);
            imageService.silentDelete(imageUrl);
            imageUrls.remove(index);
            imageUrls.add(index, newImageUrl);
        }
        imageUrls = validateAllImageUrls(imageUrls);
        trade.setImageUrls(String.join(",", imageUrls));
        tradeRepository.save(trade);
        return imageUrls;
    }

    public void deleteTradeImageByImageUrl(long id, String imageUrl) {
        Trade trade = tradeRepository.findById(id)
                                     .orElseThrow(NotFoundException::new);
        List<String> imageUrls = trade.getImageUrlsFromString();
        if (!imageUrls.contains(imageUrl)){
            throw new IllegalArgumentException("Image has already deleted");
        }
        imageUrls.remove(imageUrl);
        trade.setImageUrls(String.join(",", validateAllImageUrls(imageUrls)));
        imageService.silentDelete(imageUrl);
        tradeRepository.save(trade);
    }

    private List<String> validateAllImageUrls(List<String> imageUrls) {
        while (imageUrls.contains("")){
            imageUrls.remove("");
        }
        return imageUrls;
    }
}
