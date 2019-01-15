package com.improver.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.improver.exception.ThirdPartyException;
import com.improver.util.ThirdPartyApis;
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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class BoundariesService {

    private static final String BASE_URL = "https://www.mapreflex.com/api/v1/us";
    private static final String RADIUS_ZIP_SEARCH_URL = "/zcta/search/inRadius";
    private static final String ZIP_SEARCH_URL = "/zcta/search/byZipCodes";
    private static final String BBOX_ZIP_SEARCH_URL = "/zcta/search/inBoundingBox";
    private static final String PREPARING_REQUEST_ERROR_MESSAGE = "Error while preparing request URI to Mapreflex API. ";

    @Autowired
    private ThirdPartyApis thirdPartyApis;

    private HttpClient client;

    @PostConstruct
    public void init() {
        List<Header> headers = new ArrayList<>();
        headers.add(new BasicHeader("Accept", "application/json"));
        headers.add(new BasicHeader("X-Mapreflex-Key", thirdPartyApis.getMapreflexApiKey()));
        client = HttpClientBuilder
            .create()
            .setDefaultHeaders(headers)
            .build();
    }

    public String searchZipCodesInBbox(String southWest, String northEast) throws ThirdPartyException {
        String result;
        try {
            URIBuilder uriBuilder = new URIBuilder(BASE_URL + BBOX_ZIP_SEARCH_URL);
            uriBuilder.setParameter("southWest", southWest);
            uriBuilder.setParameter("northEast", northEast);
            result = makeRequestToMapreflex(uriBuilder);
        } catch (URISyntaxException e) {
            String message = PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }
        return result;
    }

    public String getZipBoundaries(String... zipCodes) throws ThirdPartyException {
        String result;
        try {
            URIBuilder uriBuilder = new URIBuilder(BASE_URL + ZIP_SEARCH_URL);
            uriBuilder.setParameter("zipCodes", String.join(",", zipCodes));
            result = makeRequestToMapreflex(uriBuilder);
        } catch (URISyntaxException e) {
            String message = PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }
        return result;
    }

    public String searchZipCodesInRadius(String latitude, String longitude, String radius) throws ThirdPartyException {
        String result;
        try {
            URIBuilder uriBuilder = new URIBuilder(BASE_URL + RADIUS_ZIP_SEARCH_URL);
            uriBuilder.setParameter("radius", radius);
            uriBuilder.setParameter("latitude", latitude);
            uriBuilder.setParameter("longitude", longitude);
            result = makeRequestToMapreflex(uriBuilder);
        } catch (URISyntaxException e) {
            String message = PREPARING_REQUEST_ERROR_MESSAGE + e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }
        return result;
    }


    public List<String> getZipCodesInRadius(double latitude, double longitude, int radius) throws ThirdPartyException {
        String geoJson = searchZipCodesInRadius(String.valueOf(latitude),  String.valueOf(longitude), String.valueOf(radius));
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

    private String makeRequestToMapreflex(URIBuilder uriBuilder) throws ThirdPartyException, URISyntaxException {
        HttpUriRequest request = RequestBuilder.get()
            .setUri(uriBuilder.build())
            .build();
        log.debug("Sending '" + request.getMethod() + "' request to URL : " + request.getURI());

        HttpResponse response;
        try {
            response = client.execute(request);
        } catch (IOException e) {
            String message = "Error while executing request to Mapreflex API. " + e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }

        String result;
        int statusCode;
        try {
            statusCode = response.getStatusLine().getStatusCode();
            result = EntityUtils.toString(response.getEntity());
        } catch (IOException e) {
            log.error("Error while reading response from Mapreflex API", e);
            throw new ThirdPartyException(e.getMessage());
        }

        if (statusCode != 200) {
            String message = "Error in request to Mapreflex API with statusCode " + statusCode + ". " + response.getStatusLine().getReasonPhrase();
            log.error(message);
            throw new ThirdPartyException(message);
        }

        return result;
    }

}
