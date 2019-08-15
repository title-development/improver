package com.improver.service;

import com.google.common.collect.Lists;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.improver.entity.ExtendedLocation;
import com.improver.entity.Location;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.ServedZipRepository;
import com.improver.application.properties.ThirdPartyApis;
import com.shippo.Shippo;
import com.shippo.exception.*;
import com.shippo.model.Address;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.improver.util.StringUtil.capitalize;

@Slf4j
@Service
public class LocationService {

    private static List<String> msgsToSkip = new ArrayList<>();
    static {
        msgsToSkip.add("The delivery point is currently inactive. Please check this information with the relevant address owner.");
    }

    private static final String SUGGESTION_MSG = "Some parts of address were corrected to be valid";
    private static final String INCORRECT_ADDRESS_ERROR = "Provided address seems not valid or formatted incorrectly";
    private static final String UNSUPPORTED_AREA = "Sorry, we do not support this area yet.";

    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private ThirdPartyApis thirdPartyApis;

    @PostConstruct
    public void init() {
        Shippo.setApiKey(thirdPartyApis.getShippoPrivateKey());
    }


    public ValidatedLocation validate(@Valid Location toValidate, boolean includeCoordinates, boolean checkCoverage) throws ThirdPartyException {

        try {
            Address address = Address.create(addressMap(toValidate.getStreetAddress(), toValidate.getCity(), toValidate.getState(), toValidate.getZip()));
            if (address == null) {
                throw new ThirdPartyException("Could not validate Address");
            }
            String validationMsg = SUGGESTION_MSG; //parseMsg(address.getValidationResults().getValidationMessages());

            if (address.getIsComplete() && address.getValidationResults().getIsValid()) {
                ExtendedLocation suggested = new ExtendedLocation()
                    .setStreetAddress(capitalize((String) address.getStreet1()))
                    .setCity(capitalize((String) address.getCity()))
                    .setState((String) address.getState())
                    .setZip(address.getZip().toString().substring(0, 5));

                // check the address
                String errorMsg;
                if (!suggested.getState().equalsIgnoreCase(toValidate.getState())) {
                    log.debug("State doesn't match");
                    errorMsg = "State is not valid for provided address";
                    return suggestion(suggested, errorMsg, validationMsg, checkCoverage);
                }
                if (!suggested.getCity().equalsIgnoreCase(toValidate.getCity())) {
                    log.debug("City doesn't match");
                    errorMsg = "City is not valid for provided address";
                    return suggestion(suggested, errorMsg, validationMsg, checkCoverage);
                }
                if (!suggested.getZip().equalsIgnoreCase(toValidate.getZip())) {
                    log.debug("Zip doesn't match");
                    errorMsg = "Zip code is not valid for provided address";
                    return suggestion(suggested, errorMsg, validationMsg, checkCoverage);
                }
                String suggestedStreet = suggested.getStreetAddress().toLowerCase();
                String inputStreet = toValidate.getStreetAddress().toLowerCase();
                if (!suggestedStreet.equals(inputStreet)) {
                    log.debug("Street Address doesn't match");
                    errorMsg = "Street address is not fully valid or formatted incorrectly";
                    return suggestion(suggested, errorMsg, validationMsg, checkCoverage);
                }

                return valid(includeCoordinates, suggested.withOutCoordinates(), validationMsg, checkCoverage);
            }

            // not valid
            else {
                return ValidatedLocation.invalid(INCORRECT_ADDRESS_ERROR);
            }

        } catch (ShippoException e) {
            throw new ThirdPartyException("Internal Server Error", e);
        }
    }

    private ValidatedLocation suggestion(ExtendedLocation suggested, String errorMsg, String validationMsg, boolean checkCoverage){
        if (checkCoverage && !servedZipRepository.isZipServed(suggested.getZip())){
            return ValidatedLocation.invalid(errorMsg + ". " + UNSUPPORTED_AREA);
        }
        return ValidatedLocation.suggestion(suggested, errorMsg, validationMsg);
    }

    private ValidatedLocation valid(boolean includeCoordinates, Location toValidate, String infoMsg, boolean checkCoverage) throws ThirdPartyException {
        if (checkCoverage && !servedZipRepository.isZipServed(toValidate.getZip())){
            return ValidatedLocation.invalid(UNSUPPORTED_AREA);
        }
        ExtendedLocation full = null;
        if (includeCoordinates) {
            LatLng latLng = geocoding(toValidate);
            full = new ExtendedLocation(toValidate, latLng.lat, latLng.lng);
        }
        return new ValidatedLocation(true, full, infoMsg, null);
    }


    @Deprecated
    private String parseMsg(List<Address.ValidationMessage> messages) {
        // last message is more significant!!!
        return Lists.reverse(messages).stream()
            .filter(validationMessage -> !msgsToSkip.contains(validationMessage.getText().trim()))
            .map(validationMessage -> validationMessage.getText().split("\\.")[0].trim())
            .findFirst()
            .orElse("Provided address seems not valid or formatted incorrectly");
    }




    private Map<String, Object> addressMap(String streetAddress, String city, String state, String zipCode) {
        Map<String, Object> addressMap = new HashMap<>();
        addressMap.put("street1", streetAddress);
        addressMap.put("city", city);
        addressMap.put("state", state);
        addressMap.put("zip", zipCode);
        addressMap.put("country", "US");
        addressMap.put("validate", "true");
        return addressMap;
    }



    public LatLng geocoding(Location location) throws ThirdPartyException, ValidationException {
        GeocodingResult[] results = geocodeLocation(location);
        if (results.length > 0) {
            if(results[0].partialMatch) {
                log.error("Google geocode partial match address");
                throw new ValidationException("Incorrect address");
            }
            return results[0].geometry.location;
        }
        else {
            throw new ValidationException("Address does not found");
        }
    }



    /**
     *
     *
     * <b>Note:</b> Block current threat till finish request
     */
    private GeocodingResult[] geocodeLocation(Location location) throws ThirdPartyException {
        GeoApiContext context = new GeoApiContext.Builder()
            .apiKey(thirdPartyApis.getGoogleApiKey())
            .build();
        String addressString = location.getStreetAddress() + " " + location.getCity() + " " + location.getState() + " " + location.getZip();

        try {
            return GeocodingApi.geocode(context, addressString).await();
        } catch (ApiException e) {
            throw new ThirdPartyException("Google API error", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ThirdPartyException("Interrupted Google API request", e);
        } catch (IOException e) {
            throw new ThirdPartyException("Invalid Google API response", e);
        }
    }
}
