package com.improver.controller;

import com.improver.exception.ThirdPartyException;
import com.improver.model.admin.in.ServedAreasUpdate;
import com.improver.repository.ServedZipRepository;
import com.improver.security.UserSecurityService;
import com.improver.security.annotation.AdminAccess;
import com.improver.service.BoundariesService;
import com.improver.service.CoverageService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;

import static com.improver.application.properties.Path.GEO_PATH;

@Slf4j
@RestController
@RequestMapping(GEO_PATH)
public class BoundariesController {

    @Autowired private BoundariesService boundariesService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private ResourceLoader resourceLoader;
    @Autowired private CoverageService coverageService;
    @Autowired private UserSecurityService userSecurityService;

    private static String coverageGeometry;

    @PostConstruct
    public void init() throws IOException {
        Resource resource = resourceLoader.getResource("classpath:/coverage.json");
        coverageGeometry = IOUtils.toString(resource.getInputStream());
    }


    @GetMapping("/coverage/json")
    public ResponseEntity<Object> getCoverageJson() {
        return new ResponseEntity<>(coverageGeometry, HttpStatus.OK);
    }

    @GetMapping("/coverage/zips")
    public ResponseEntity<List<String>> getAllServedZips() {
        List<String> allServedZips = servedZipRepository.getAllServedZips();
        return new ResponseEntity<>(allServedZips, HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping("/coverage/zips")
    public ResponseEntity<Void> updateServedZips(@RequestBody List<String> zips) {
        coverageService.updateZipCodesCoverage(zips, userSecurityService.currentAdmin());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/coverage/isZipSupported")
    public ResponseEntity<Boolean> isZipSupported(@RequestParam("zip") String zip) {
        boolean isSupported = servedZipRepository.isZipServed(zip.toLowerCase());
        return new ResponseEntity<>(isSupported, HttpStatus.OK);
    }

    @GetMapping("/zips/boundaries")
    public ResponseEntity<String> getZipCodesBoundaries(@RequestParam String[] zipCodes) throws ThirdPartyException {
        String result = boundariesService.getZipBoundaries(zipCodes);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/counties/boundaries")
    public ResponseEntity<String> getCountiesBoundaries(@RequestParam String[] counties) throws ThirdPartyException {
        String result = boundariesService.getCountyBoundaries(counties);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/zips/search/bbox/boundaries")
    public ResponseEntity<String> searchZipCodesInBbox(@RequestParam String southWest, @RequestParam String northEast) throws ThirdPartyException {
        String result = boundariesService.searchZipCodesInBbox(southWest, northEast);

        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/zips/search/radius/boundaries")
    public ResponseEntity<String> searchZipCodesInRadius(@RequestParam String latitude, @RequestParam String longitude, @RequestParam int radius) throws ThirdPartyException {
        String result = boundariesService.searchZipCodesInRadius(latitude, longitude, radius);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/coverage/counties")
    public ResponseEntity<List<String>> getAllServedCounties() {
        List<String> allServedCounties = servedZipRepository.getAllServedCounties();
        return new ResponseEntity<>(allServedCounties, HttpStatus.OK);
    }

    @AdminAccess
    @PutMapping("/coverage/counties")
    public ResponseEntity<Void> updateServedCounties(@RequestBody ServedAreasUpdate servedAreasUpdate) throws InterruptedException, ThirdPartyException {
        coverageService.updateCountiesCoverage(servedAreasUpdate, userSecurityService.currentAdmin());
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/counties/search/bbox/boundaries")
    public ResponseEntity<String> searchCountiesInBbox(@RequestParam String southWest, @RequestParam String northEast) throws ThirdPartyException {
        String result = boundariesService.searchCountiesInBbox(southWest, northEast);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

}
