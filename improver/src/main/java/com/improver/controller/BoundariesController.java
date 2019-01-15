package com.improver.controller;

import com.improver.entity.ServedZip;
import com.improver.exception.InternalServerException;
import com.improver.exception.ThirdPartyException;
import com.improver.repository.ServedZipRepository;
import com.improver.security.annotation.AdminAccess;
import com.improver.service.BoundariesService;
import com.improver.service.CoverageService;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.application.properties.Path.GEO_PATH;

@RestController
@RequestMapping(GEO_PATH)
public class BoundariesController {

    private final Logger log = LoggerFactory.getLogger(getClass());

    private final String GEO_API_ERROR = "Error in request to Mapreflex API";

    @Autowired private BoundariesService boundariesService;
    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private ResourceLoader resourceLoader;
    @Autowired private CoverageService coverageService;

    private String coverageGeometry;

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
        coverageService.updateCoverage(zips);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/coverage/isZipSupported")
    public ResponseEntity<Boolean> isZipSupported(@RequestParam("zip") String zip) {
        boolean isSupported = servedZipRepository.isZipServed(zip.toLowerCase());
        return new ResponseEntity<>(isSupported, HttpStatus.OK);
    }

    @GetMapping("/zips/boundaries")
    public ResponseEntity<String> getZipCodesBoundaries(@RequestParam String[] zipCodes) {
        String result;
        try {
            result = boundariesService.getZipBoundaries(zipCodes);
        } catch (ThirdPartyException e) {
            log.error(GEO_API_ERROR, e);
            throw new InternalServerException(e.getMessage());
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/zips/search/bbox/boundaries")
    public ResponseEntity<String> searchZipCodesInBbox(@RequestParam String southWest, @RequestParam String northEast) {
        String result;
        try {
            result = boundariesService.searchZipCodesInBbox(southWest, northEast);
        } catch (ThirdPartyException e) {
            log.error(GEO_API_ERROR, e);
            throw new InternalServerException(e.getMessage());
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/zips/search/radius/boundaries")
    public ResponseEntity<String> searchZipCodesInRadius(@RequestParam String latitude, @RequestParam String longitude, @RequestParam String radius) {
        String result;
        try {
            result = boundariesService.searchZipCodesInRadius(latitude, longitude, radius);
        } catch (ThirdPartyException e) {
            log.error(GEO_API_ERROR, e);
            throw new InternalServerException("Error in request to Mapreflex API. " + e.getMessage());
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

}
