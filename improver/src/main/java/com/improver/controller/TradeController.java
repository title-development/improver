package com.improver.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.model.admin.AdminTrade;
import com.improver.repository.TradeRepository;
import com.improver.security.annotation.AdminAccess;
import com.improver.security.annotation.StaffAccess;
import com.improver.security.annotation.SupportAccess;
import com.improver.service.TradeService;
import com.improver.util.annotation.PageableSwagger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static com.improver.application.properties.Path.*;
import static com.improver.util.serializer.SerializationUtil.fromJson;


@RestController
@RequestMapping(TRADES_PATH)
public class TradeController {

    @Autowired private TradeService tradeService;

    @SupportAccess
    @GetMapping
    @PageableSwagger
    public ResponseEntity<Page<AdminTrade>> getAllTrades(
        @RequestParam(required = false) Long id,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String description,
        @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageRequest) {
        Page<AdminTrade> trades = tradeService.getAllTrades(id, name, description, pageRequest);

        return new ResponseEntity<>(trades, HttpStatus.OK);
    }

    @PutMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<List<String>> updateTradeImages(@PathVariable long id,
                                                          @RequestParam(value = "index") int index,
                                                          @RequestPart(value = "file") MultipartFile file){
        List<String> imageUrls = tradeService.updateTradeImages(id, index, file);
        return new ResponseEntity<>(imageUrls, HttpStatus.OK);
    }

    @DeleteMapping(ID_PATH_VARIABLE + IMAGES)
    public ResponseEntity<Void> deleteTradeImage(@PathVariable long id,
                                                 @RequestParam String imageUrl){
        tradeService.deleteTradeImageByImageUrl(id, imageUrl);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping(ID_PATH_VARIABLE)
    public ResponseEntity<AdminTrade> getTradeById(@PathVariable long id) {
        AdminTrade adminTrade = tradeService.getTradeById(id);

        return new ResponseEntity<>(adminTrade, HttpStatus.OK);
    }


    @AdminAccess
    @PutMapping(value = ID_PATH_VARIABLE)
    ResponseEntity<Void> updateTrade(@PathVariable long id,
                                     @RequestPart(value = "data") String data) {
        AdminTrade adminTrade = fromJson(new TypeReference<AdminTrade>() {
        }, data);
        tradeService.updateTrade(id, adminTrade);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @AdminAccess
    @PostMapping
    ResponseEntity<Long> addTrade(@RequestPart(value = "data") String data,
                                  @RequestPart(value = "file", required = false) MultipartFile image) {
        AdminTrade adminTrade = fromJson(new TypeReference<>() {}, data);
        return new ResponseEntity<>(tradeService.addTrade(adminTrade, image),HttpStatus.OK);
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
