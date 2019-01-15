package com.improver.controller;

import com.improver.entity.Location;
import com.improver.exception.InternalServerException;
import com.improver.exception.ThirdPartyException;
import com.improver.model.out.ValidatedLocation;
import com.improver.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.improver.application.properties.Path.LOCATIONS_PATH;

@RestController
@RequestMapping(LOCATIONS_PATH)
public class LocationController {

    @Autowired
    private LocationService locationService;

    @GetMapping("/validation")
    public ResponseEntity<ValidatedLocation> locationValidation(@RequestParam String streetAddress,
                                                                @RequestParam String city,
                                                                @RequestParam String state,
                                                                @RequestParam String zip,
                                                                @RequestParam(defaultValue = "false") boolean coordinates,
                                                                @RequestParam(defaultValue = "false") boolean checkCoverage) {
        ValidatedLocation validated = null;
        try {
            validated = locationService.validate(new Location(streetAddress, city, state, zip), coordinates, checkCoverage);
        } catch (ThirdPartyException e) {
            throw new InternalServerException("Could not validate Address", e);
        }

        return new ResponseEntity<>(validated, HttpStatus.OK);

    }

}
