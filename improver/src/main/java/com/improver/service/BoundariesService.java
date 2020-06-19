package com.improver.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.improver.application.properties.ThirdPartyApis;
import com.improver.exception.BadRequestException;
import com.improver.exception.ThirdPartyException;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.message.BasicHeader;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
@Service
public class BoundariesService {

    private static final String BASE_URL = "https://mapreflex.p.rapidapi.com/api/us/v1";
    private static final String RADIUS_ZIP_SEARCH_URL = "/zipcodes/search/in-radius";
    private static final String ZIP_SEARCH_URL = "/zipcodes/by-ids";
    private static final String ZIP_BY_COUNTY = "/zipcodes/by-counties";
    private static final String COUNTY_SEARCH_URL = "/counties/by-ids";
    private static final String BBOX_ZIP_SEARCH_URL = "/zipcodes/search/in-bounding-box";
    private static final String BBOX_COUNTY_SEARCH_URL = "/counties/search/in-bounding-box";
    private static final String PREPARING_REQUEST_ERROR_MESSAGE = "Error while preparing request URI to Mapreflex API. ";

    @Autowired private ThirdPartyApis thirdPartyApis;
    private HttpClient client;

    @PostConstruct
    public void init() {
        List<Header> headers = new ArrayList<>();
        headers.add(new BasicHeader("Accept", "application/json"));
        headers.add(new BasicHeader("x-rapidapi-host", "mapreflex.p.rapidapi.com"));
        headers.add(new BasicHeader("x-rapidapi-key", thirdPartyApis.getMapreflexApiKey()));
        client = HttpClientBuilder
            .create()
            .setDefaultHeaders(headers)
            .build();
    }


    public String searchZipCodesInBbox(String southWest, String northEast) throws ThirdPartyException {
        HttpUriRequest request;
        log.debug("Zipcodes bbox area=" +  areaOfBbox(southWest, northEast));
        try {
            URI uri = new URIBuilder(BASE_URL + BBOX_ZIP_SEARCH_URL)
                .setParameter("southWest", southWest)
                .setParameter("northEast", northEast)
                .setParameter("properties", "zip,centroid")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        return makeRequestToMapreflex(request);
    }


    public String getZipBoundaries(String... zipCodes) throws ThirdPartyException {
        HttpUriRequest request;
        log.trace("ZIP Codes array size=" + zipCodes.length);

        try {
            URI uri = new URIBuilder(BASE_URL + ZIP_SEARCH_URL)
                .setParameter("ids", String.join(",", zipCodes))
                .setParameter("properties", "zip,centroid")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        return makeRequestToMapreflex(request);
    }


    public String getCountyBoundaries(String... counties) throws ThirdPartyException {
        HttpUriRequest request;
        try {
            URI uri = new URIBuilder(BASE_URL + COUNTY_SEARCH_URL)
                .setParameter("ids", String.join(",", counties))
                .setParameter("properties", "centroid,name,state")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        return makeRequestToMapreflex(request);
    }

    public String searchZipCodesInRadius(String latitude, String longitude, int radius) throws ThirdPartyException {
        HttpUriRequest request;
        try {
            URI uri = new URIBuilder(BASE_URL + RADIUS_ZIP_SEARCH_URL)
                .setParameter("radius", String.valueOf(radius))
                .setParameter("latitude", latitude)
                .setParameter("longitude", longitude)
                .setParameter("properties", "zip,centroid")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        return makeRequestToMapreflex(request);
    }


    public String searchCountiesInBbox(String southWest, String northEast) throws ThirdPartyException {
        HttpUriRequest request;
        log.debug("Counties bbox area=" +  areaOfBbox(southWest, northEast));
        try {
            URI uri = new URIBuilder(BASE_URL + BBOX_COUNTY_SEARCH_URL)
                .setParameter("southWest", southWest)
                .setParameter("northEast", northEast)
                .setParameter("properties", "name,centroid,state")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        return makeRequestToMapreflex(request);
    }

    public List<String> getZipCodesInRadius(double latitude, double longitude, int radius) throws ThirdPartyException {
        String geoJson = searchZipCodesInRadius(String.valueOf(latitude), String.valueOf(longitude), radius);
        List<String> zipCodes = new ArrayList<>();
        try {
            JsonNode rootNode = SerializationUtil.mapper().readTree(geoJson);
            rootNode.get("features").elements().forEachRemaining(feature ->
                zipCodes.add(feature.get("properties").get("zip").asText()));
            return zipCodes;
        } catch (IOException e) {
            throw new ThirdPartyException("Error parsing response from searchZipInRadius()", e);
        }

    }

    public JsonNode getZipCodesByCounties(String ...countyIds) throws ThirdPartyException {
        HttpUriRequest request;
        try {
            URI uri = new URIBuilder(BASE_URL + ZIP_BY_COUNTY)
                .setParameter("countyIds", String.join(",", countyIds))
                .setParameter("properties", "zip,centroid")
                .build();
            request = RequestBuilder.get().setUri(uri).build();
        } catch (URISyntaxException e) {
            throw new ThirdPartyException(PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage());
        }
        String geoJson =  makeRequestToMapreflex(request);
        return mapToJson(geoJson);
    }

    private String makeRequestToMapreflex(HttpUriRequest request) throws ThirdPartyException {
        log.trace("Sending '" + request.getMethod() + "' request to URL : " + request.getURI());
        HttpResponse response;
        String result;

        try {
            response = client.execute(request);
            result = EntityUtils.toString(response.getEntity());
        } catch (IOException e) {
            String message = "Error while executing request to Mapreflex API. " + e.getMessage();
            throw new ThirdPartyException(message);
        }

        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode != 200) {
            JsonNode jsonNode = null;
            String defMsg = "Error in request to Mapreflex API with statusCode " + statusCode + ". " + response.getStatusLine().getReasonPhrase();
            String msg;
            try {
                jsonNode = SerializationUtil.mapper().readTree(result);
                msg = jsonNode.get("message").asText(defMsg);
                if (statusCode == HttpStatus.BAD_REQUEST.value()) {
                    throw new BadRequestException(msg);
                } else {
                    throw new ThirdPartyException(msg);
                }
            } catch (IOException e) {
                throw new ThirdPartyException(defMsg);
            }
        }

        return result;
    }

    private JsonNode mapToJson(String geoJson) throws ThirdPartyException {
        try {
            return SerializationUtil.mapper().readTree(geoJson);
        } catch (IOException e) {
            throw new ThirdPartyException("Error parsing response from searchZipInRadius()", e);
        }
    }


    /**
     * Perimeter in miles of bounding box
     */
    private double areaOfBbox(String sw, String ne){
        double[] southWest = Arrays.stream(sw.split(","))
            .mapToDouble(Double::parseDouble)
            .toArray();
        double[] northEast = Arrays.stream(ne.split(","))
            .mapToDouble(Double::parseDouble)
            .toArray();
        double[] northwest = {northEast[0], southWest[1]};
        double a = distanceFrom(southWest[0], southWest[1], northwest[0], northwest[1]);
        double b = distanceFrom(northwest[0], northwest[1], northEast[0], northEast[1]);
        return a *b;
    }


    /**
     * Distance in miles
     */
    private double distanceFrom(double lat1, double lng1, double lat2, double lng2) {
        double earthRadius = 6371000; //meters
        double dLat = Math.toRadians(lat2-lat1);
        double dLng = Math.toRadians(lng2-lng1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        double dist = (earthRadius * c);
        dist /= 1609.344; // convert meters to miles
        return dist;
    }

}
