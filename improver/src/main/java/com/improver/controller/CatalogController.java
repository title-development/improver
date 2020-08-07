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

import static com.improver.application.properties.Path.*;
import static com.improver.application.properties.SystemProperties.POPULAR_TRADES_CACHE_EXPIRATION;

@RestController
@RequestMapping(CATALOG_PATH)
public class CatalogController {

    @Autowired private TradeService tradeService;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeService serviceTypeService;
    @Autowired private ServiceTypeRepository serviceTypeRepository;

    /**
     * Deprecated
     * Returns suggested {@link ServiceType} list represented by list of {@link NameIdImageTuple}'s.
     *
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @Deprecated
    @GetMapping(SERVICES + SUGGESTED)
    public ResponseEntity<List<NameIdImageTuple>> getSuggestedServices(@RequestParam(defaultValue = "8") int size) {
        // TODO: Done for testing of images at home page. Will be removed later
        List<NameIdImageTuple> services = serviceTypeRepository.getRandomPopularServiceTypes(PageRequest.of(0, size))
            .getContent();
        return ResponseEntity.ok().body(services);
    }

    /**
     * Returns popular {@link ServiceType} list represented by list of {@link NameIdImageTuple}'s.
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
     * Returns recommended {@link ServiceType} list represented by list of {@link NameIdImageTuple}'s.
     *
     * Used in Customer dashboard
     */
    @GetMapping(SERVICES + RECOMMENDED)
    public ResponseEntity<List<NameIdImageTuple>> getRecommendedServices(@RequestParam(defaultValue = "6") int size) {
        return getSuggestedServices(size);
    }


    @GetMapping(SERVICES)
    public ResponseEntity<List<OfferedService>> getAllServicesModel() {
        List<OfferedService> services = serviceTypeService.getAllServicesModel();
        return new ResponseEntity<>(services, HttpStatus.OK);
    }


    /**
     * Returns {@link Trade} list represented by list of {@link NameIdTuple}'s.
     * <p>
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @GetMapping(TRADES)
    public ResponseEntity<List<NameIdTuple>> getAllTradesModel() {
        List<NameIdTuple> trades = tradeService.getAllTradesModel();
        return ResponseEntity.ok()
            .body(trades);
    }


    @GetMapping(TRADES + POPULAR)
    public ResponseEntity<List<NameIdImageTuple>> getPopularTrades(@RequestParam(defaultValue = "12") int size) {
        List<NameIdImageTuple> popular = tradeRepository.getPopular(PageRequest.of(0, size)).getContent();
        return new ResponseEntity<>(popular, HttpStatus.OK);
    }

    @GetMapping(TRADES + SUGGESTED)
    public ResponseEntity<List<TradeModel>> getSuggestedTrades(@RequestParam(defaultValue = "8") int size) {
        HttpHeaders headers = new HttpHeaders();
        List<TradeModel> suggested = tradeService.getCachedTrades();
        headers.setCacheControl(CacheControl.maxAge(POPULAR_TRADES_CACHE_EXPIRATION.getSeconds(), TimeUnit.SECONDS).getHeaderValue());
        return new ResponseEntity<>(suggested, headers, HttpStatus.OK);
    }

    /**
     * Returns recommended {@link Trade} list represented by list of {@link NameIdImageTuple}'s.
     *
     * Used in Customer dashboard
     */
    @GetMapping(TRADES + RECOMMENDED)
    public ResponseEntity<List<TradeModel>> getRecommendedTrades(@RequestParam(defaultValue = "6") int size) {
        return getSuggestedTrades(size);
    }

    @GetMapping(TRADES + ID_PATH_VARIABLE + SERVICES)
    public ResponseEntity<List<OfferedService>> getServices(@PathVariable long id) {
        List<OfferedService> services = serviceTypeRepository.getActiveByTradeId(id);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    /**
     * Returns {@link Trade} list represented by list of {@link NameIdTuple}'s.
     * <p>
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @GetMapping
    public ResponseEntity<List<TradeAndServices>> getAllTradesAndServices() {
        List<TradeAndServices> trades = tradeService.getAllTradesAndServices();
        return ResponseEntity.ok()
            .body(trades);
    }
}
