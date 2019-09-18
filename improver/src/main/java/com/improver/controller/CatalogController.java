package com.improver.controller;

import com.improver.entity.Question;
import com.improver.entity.ServiceType;
import com.improver.entity.Trade;
import com.improver.exception.NotFoundException;
import com.improver.model.NameIdTuple;
import com.improver.model.out.NameIdImageTuple;
import com.improver.model.out.TradeAndServices;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.TradeRepository;
import com.improver.service.ServiceTypeService;
import com.improver.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static com.improver.application.properties.Path.CATALOG_PATH;
import static com.improver.application.properties.Path.ID_PATH_VARIABLE;
import static com.improver.application.properties.Path.POPULAR;
import static com.improver.application.properties.Path.QUESTIONARY;
import static com.improver.application.properties.Path.SERVICES;
import static com.improver.application.properties.Path.TRADES;

@RestController
@RequestMapping(CATALOG_PATH)
public class CatalogController {

    @Autowired private TradeService tradeService;
    @Autowired private TradeRepository tradeRepository;
    @Autowired private ServiceTypeService serviceTypeService;
    @Autowired private ServiceTypeRepository serviceTypeRepository;


    /**
     * Returns popular {@link ServiceType} list represented by list of {@link NameIdImageTuple}'s.
     *
     * <b>Note</b> {@link CacheControl} is used to reduce REST API calls and improve performance.
     */
    @Deprecated
    @GetMapping(SERVICES + POPULAR)
    public ResponseEntity<List<NameIdImageTuple>> getPopularServices(@RequestParam(defaultValue = "12") int size) {
//        List<NameIdImageTuple> services = serviceTypeService.getPopularServices(size);
//        TODO: Done for testing of images at home page. Will be removed later
        List<NameIdImageTuple> services = serviceTypeService.getRandomAsModels(size);
        if (services.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
            .body(services);
    }


    @Deprecated
    @GetMapping(SERVICES + "/recommended")
    public ResponseEntity<List<NameIdImageTuple>> getRecommendedServices(@RequestParam long userId, @RequestParam(defaultValue = "6") int size) {
        return getPopularServices(size);
    }


    @GetMapping(SERVICES)
    public ResponseEntity<List<NameIdTuple>> getAllServicesModel() {
        List<NameIdTuple> services = serviceTypeService.getAllServicesModel();

        return new ResponseEntity<>(services, HttpStatus.OK);
    }


    @GetMapping(QUESTIONARY + ID_PATH_VARIABLE)
    public ResponseEntity<List<Question>> getQuestionary(@PathVariable long id) {
        ServiceType serviceType = serviceTypeRepository.findById(id)
            .orElseThrow(NotFoundException::new);
        List<Question> questions = (serviceType.getQuestionary() != null) ? serviceType.getQuestionary().getQuestions()
            : Collections.emptyList();
        return new ResponseEntity<>(questions, HttpStatus.OK);
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


    @GetMapping(TRADES + ID_PATH_VARIABLE + SERVICES)
    public ResponseEntity<List<NameIdTuple>> getServices(@PathVariable long id) {
        List<NameIdTuple> services = tradeService.getActiveServicesForTrade(id);
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
