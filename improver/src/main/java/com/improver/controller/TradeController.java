package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.model.admin.AdminTrade;
import com.improver.repository.TradeRepository;
import com.improver.security.annotation.StaffAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.TradeService;
import com.improver.util.annotation.PageableSwagger;
import com.improver.security.annotation.AdminAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static com.improver.application.properties.Path.*;
import static com.improver.util.serializer.SerializationUtil.fromJson;


@RestController
@RequestMapping(TRADES_PATH)
public class TradeController {

    @Autowired private TradeService tradeService;
    @Autowired private TradeRepository tradeRepository;

    @SupportAccess
    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<AdminTrade>> getAllTrades(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) Integer ratingFrom,
        @RequestParam(required = false) Integer ratingTo,
        @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminTrade> trades = tradeService.getAllTrades(id, name, description, ratingFrom, ratingTo, pageRequest);

        return new ResponseEntity<>(trades, HttpStatus.OK);
    }


    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminTrade> getTradeById(@PathVariable long id) {
        AdminTrade adminTrade = tradeService.getTradeById(id);

        return new ResponseEntity<>(adminTrade, HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(value = ID_PATH_VARIABLE)
    ResponseEntity<Void> updateTrade(@PathVariable long id,
                                     @RequestPart(value = "data") String data,
                                     @RequestPart(value = "file", required = false) MultipartFile image) {
        AdminTrade adminTrade = fromJson(new TypeReference<AdminTrade>() {
        }, data);
        tradeService.updateTrade(id, adminTrade, image);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping
    ResponseEntity<Void> addTrade(@RequestPart(value = "data") String data,
                                  @RequestPart(value = "file", required = false) MultipartFile image) {
        AdminTrade adminTrade = fromJson(new TypeReference<AdminTrade>() {
        }, data);
        tradeService.addTrade(adminTrade, image);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @DeleteMapping(ID_PATH_VARIABLE)
    ResponseEntity<Void> deleteTrade(@PathVariable long id) {
        tradeService.deleteTrade(id);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping(IS_NAME_FREE)
    ResponseEntity<Void> isNameFree(@RequestParam String tradeName) {

        return new ResponseEntity<>(tradeService.isNameFree(tradeName) ? HttpStatus.OK : HttpStatus.CONFLICT);
    }
}
