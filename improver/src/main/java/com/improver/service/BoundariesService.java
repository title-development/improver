package com.improver.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.improver.exception.ThirdPartyException;
import com.improver.application.properties.ThirdPartyApis;
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
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class BoundariesService {

    private static final String BASE_URL = "https://www.mapreflex.com/api/us/v1";
    //private static final String BASE_URL = "http://127.0.0.1:8033/api/us/v1";
    private static final String RADIUS_ZIP_SEARCH_URL = "/zipcodes/search/in-radius";
    private static final String ZIP_SEARCH_URL = "/zipcodes/by-ids";
    private static final String BBOX_ZIP_SEARCH_URL = "/zipcodes/search/in-bounding-box";
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
        HttpUriRequest request;
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


    // TODO: split into couple requests on UI side
    public String getZipBoundaries(String... zipCodes) throws ThirdPartyException {
        HttpUriRequest request;
        if (zipCodes.length > 200) {
            log.debug("ZIP Code array size=" + zipCodes.length);
        }
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


    public String searchZipCodesInRadius(String latitude, String longitude, String radius) throws ThirdPartyException {
        HttpUriRequest request;
        try {
            URI uri = new URIBuilder(BASE_URL + RADIUS_ZIP_SEARCH_URL)
                .setParameter("radius", radius)
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


    private String makeRequestToMapreflex(HttpUriRequest request) throws ThirdPartyException {
        log.debug("Sending '" + request.getMethod() + "' request to URL : " + request.getURI());
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
                throw new ThirdPartyException(msg);
            } catch (IOException e) {
                throw new ThirdPartyException(defMsg);
            }
        }

        return result;
    }


    public List<String> getZipCodesInRadius(double latitude, double longitude, int radius) throws ThirdPartyException {
        String geoJson = searchZipCodesInRadius(String.valueOf(latitude), String.valueOf(longitude), String.valueOf(radius));
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

}
