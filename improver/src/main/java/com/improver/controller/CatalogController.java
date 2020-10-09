package com.improver.controller;

import com.improver.entity.ServiceType;
import com.improver.entity.Trade;
import com.improver.model.NameIdTuple;
import com.improver.model.OfferedService;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.TradeAndServices;
import com.improver.model.out.TradeModel;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.TradeRepository;
import com.improver.service.ServiceTypeService;
import com.improver.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.SystemProperties.ADVERTISED_TRADES_CACHE_EXPIRATION;
import static com.improver.application.properties.SystemProperties.SERVICE_CATALOG_CACHE_DURATION;

@RestController
@RequestMapping(CATALOG_PATH)
public class CatalogController {

    private static final HttpHeaders cacheControl = new HttpHeaders();
    static {
        cacheControl.setCacheControl(CacheControl.maxAge(SERVICE_CATALOG_CACHE_DURATION.getSeconds(), TimeUnit.SECONDS));
    }

    @Autowired private TradeService tradeService;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeService serviceTypeService;
    @Autowired private ServiceTypeRepository serviceTypeRepository;




    /**
     * Returns {@link Trade} list represented by list of {@link NameIdTuple}'s.
     * <p>
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @GetMapping
    public ResponseEntity<List<TradeAndServices>> getAllTradesAndServices() {
        List<TradeAndServices> trades = tradeService.getAllTradesAndServices();
        return new ResponseEntity<>(trades, cacheControl, HttpStatus.OK);
    }


    @GetMapping(SERVICES)
    public ResponseEntity<List<OfferedService>> getAllServicesModel() {
        List<OfferedService> services = serviceTypeService.getAllServicesModel();
        return new ResponseEntity<>(services, cacheControl, HttpStatus.OK);
    }


    /**
     * Returns popular {@link ServiceType}
     *
     * Used at Home Page and Find Professionals dropdown
     */
    @GetMapping(SERVICES + POPULAR)
    public ResponseEntity<List<NameIdTuple>> getPopularServices(@RequestParam(defaultValue = "12") int size){
        List<NameIdTuple> popularServices = serviceTypeRepository.getPopularServiceTypes(PageRequest.of(0, size))
            .getContent();
        return new ResponseEntity<>(popularServices, HttpStatus.OK);
    }


    /**
     * Returns {@link Trade} list
     * <p>
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @GetMapping(TRADES)
    public ResponseEntity<List<NameIdTuple>> getAllTradesModel() {
        List<NameIdTuple> trades = tradeService.getAllTradesModel();
        return new ResponseEntity<>(trades, cacheControl, HttpStatus.OK);
    }


    @GetMapping(TRADES + POPULAR)
    public ResponseEntity<List<NameIdImageTuple>> getPopularTrades(@RequestParam(defaultValue = "12") int size) {
        List<NameIdImageTuple> popular = tradeRepository.getPopular(PageRequest.of(0, size)).getContent();
        return new ResponseEntity<>(popular, HttpStatus.OK);
    }


    /**
     * Returns advertised {@link Trade} list.
     * Used in the home page
     */
    @GetMapping(TRADES + SUGGESTED)
    public ResponseEntity<List<TradeModel>> getAdvertisedTrades(@RequestParam int size) {
        HttpHeaders headers = new HttpHeaders();
        List<TradeModel> suggested = tradeService.getAdvertisedTradesWithServicesFromCache().stream()
            .limit(size)
            .collect(Collectors.toList());
        headers.setCacheControl(CacheControl.maxAge(ADVERTISED_TRADES_CACHE_EXPIRATION.getSeconds(), TimeUnit.SECONDS));
        return new ResponseEntity<>(suggested, headers, HttpStatus.OK);
    }


    /**
     * Returns recommended {@link Trade} list for given customer, used in Customer dashboard.
     * Now returns advertised
     */
    @GetMapping(TRADES + RECOMMENDED)
    public ResponseEntity<List<TradeModel>> getRecommendedTrades(@RequestParam(defaultValue = "6") int size) {
        return getAdvertisedTrades(size);
    }


    @GetMapping(TRADES + ID_PATH_VARIABLE + SERVICES)
    public ResponseEntity<List<OfferedService>> getServices(@PathVariable long id) {
        List<OfferedService> services = serviceTypeRepository.getActiveByTradeId(id);
        return new ResponseEntity<>(services, cacheControl, HttpStatus.OK);
    }
}
