package com.improver.service;

import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.errors.ApiException;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.improver.application.properties.ThirdPartyApis;
import com.improver.entity.ExtendedLocation;
import com.improver.entity.Location;
import com.improver.exception.ThirdPartyException;
import com.improver.exception.ValidationException;
import com.improver.model.UserAddressModel;
import com.improver.model.out.ValidatedLocation;
import com.improver.repository.ServedZipRepository;
import com.shippo.Shippo;
import com.shippo.exception.ShippoException;
import com.shippo.model.Address;
import lombok.extern.slf4j.Slf4j;
import net.ricecode.similarity.JaroWinklerStrategy;
import net.ricecode.similarity.StringSimilarityService;
import net.ricecode.similarity.StringSimilarityServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.validation.Valid;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static com.improver.util.StringUtil.capitalize;

@Slf4j
@Service
public class LocationService {

    private static final String SUGGESTION_MSG = "Some parts of address were corrected to be valid";
    private static final String INCORRECT_ADDRESS_ERROR = "Provided address seems not valid or formatted incorrectly";
    private static final String UNSUPPORTED_AREA = "Sorry, we do not support this area yet.";
    private static final double STREET_ADDRESS_MIN_SIMILARITY_SCORE = 0.9;

    @Autowired private ServedZipRepository servedZipRepository;
    @Autowired private ThirdPartyApis thirdPartyApis;
    private final StringSimilarityService similarityService = new StringSimilarityServiceImpl(new JaroWinklerStrategy());

    @PostConstruct
    public void init() {
        Shippo.setApiKey(thirdPartyApis.getShippoPrivateKey());
    }


    public ValidatedLocation validateProjectAddress(UserAddressModel address) throws ThirdPartyException {
        Location projectLoc = new Location().setStreetAddress(address.getStreetAddress())
            .setCity(address.getCity())
            .setState(address.getState())
            .setZip(address.getZip());
        return validate(projectLoc,  false, true, address.getIsAddressManual());
    }


    public ValidatedLocation validate(@Valid Location toValidate, boolean includeCoordinates, boolean checkCoverage, boolean isManual) throws ThirdPartyException {

        try {
            Address address = Address.create(addressMap(toValidate.getStreetAddress(), toValidate.getCity(), toValidate.getState(), toValidate.getZip()));
            if (address == null) {
                throw new ThirdPartyException("Could not validate Address");
            }
            String validationMsg = SUGGESTION_MSG;

            if (!address.getIsComplete() || !address.getValidationResults().getIsValid()) {
                // code = "Ambiguous Address"
                // text = "Multiple addresses were found for the information you entered, and no default exists."
                String msg = Optional.ofNullable(address.getValidationResults().getValidationMessages().get(0).getText())
                    .orElse(INCORRECT_ADDRESS_ERROR);
                address.getValidationResults().getValidationMessages()
                    .forEach(message -> log.debug("Validation: " + message.getCode() + " : "  + message.getText()));
                return ValidatedLocation.invalid(msg);
            }

            else {
                ExtendedLocation validated = new ExtendedLocation((String) address.getStreet1(),
                (String) address.getCity(), (String) address.getState(), address.getZip().toString().substring(0, 5), isManual);

                // check the address
                String errorMsg;
                if (!validated.getState().equalsIgnoreCase(toValidate.getState())) {
                    log.trace("State doesn't match");
                    errorMsg = "State is not valid for provided address";
                    return suggestion(validated, errorMsg, validationMsg, checkCoverage);
                }
                if (!validated.getCity().equalsIgnoreCase(toValidate.getCity())) {
                    log.trace("City doesn't match");
                    errorMsg = "City is not valid for provided address";
                    return suggestion(validated, errorMsg, validationMsg, checkCoverage);
                }
                if (!validated.getZip().equalsIgnoreCase(toValidate.getZip())) {
                    log.trace("Zip doesn't match");
                    errorMsg = "Zip code is not valid for provided address";
                    return suggestion(validated, errorMsg, validationMsg, checkCoverage);
                }

                String suggestedStreet = validated.getStreetAddress().toLowerCase();
                String inputStreet = toValidate.getStreetAddress().toLowerCase();
                double similarityScore = similarityService.score(inputStreet, suggestedStreet);
                if (similarityScore < STREET_ADDRESS_MIN_SIMILARITY_SCORE) {
                    if (isManual && similarityScore >= 0.7) {
                        log.trace("Manual street address validation score=" + similarityScore);
                        validationMsg = "";
                        return valid(includeCoordinates, validated.withOutCoordinates(), validationMsg, checkCoverage);
                    } else {
                        log.trace("Street Address doesn't match");
                        errorMsg = "Street address is not fully valid or formatted incorrectly";
                        return suggestion(validated, errorMsg, validationMsg, checkCoverage);
                    }
                }

                return valid(includeCoordinates, validated.withOutCoordinates(), validationMsg, checkCoverage);
            }

        } catch (ShippoException e) {
            throw new ThirdPartyException("Internal Server Error", e);
        }
    }

    private ValidatedLocation suggestion(ExtendedLocation suggested, String errorMsg, String validationMsg, boolean checkCoverage){
        if (checkCoverage && !servedZipRepository.isZipServed(suggested.getZip())){
            return ValidatedLocation.invalid(errorMsg);
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
        return ValidatedLocation.valid(full, infoMsg);
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
