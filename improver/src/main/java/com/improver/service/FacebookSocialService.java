package com.improver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.ThirdPartyException;
import com.improver.model.socials.FacebookUserProfile;
import com.improver.model.socials.PhoneSocialCredentials;
import com.improver.model.socials.SocialUser;
import com.improver.util.serializer.SerializationUtil;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.net.URISyntaxException;

@Service
public class FacebookSocialService {

    @Autowired private SocialConnectionService socialConnectionService;

    private final Logger log = LoggerFactory.getLogger(getClass());
    private final String FB_API_VERSION = "v3.1";

    private HttpClient client;

    @PostConstruct
    public void init() {
        client = HttpClientBuilder
            .create()
            .build();
    }

    public User loginOrRegister(String accessToken) {
        SocialUser socialUser = getSocialUser(accessToken);

        return socialConnectionService.findExistingOrRegister(socialUser);
    }

    public User registerPro(PhoneSocialCredentials phoneSocialCredentials) {
        SocialUser socialUser = getSocialUser(phoneSocialCredentials.getAccessToken());

        return socialConnectionService.registerPro(socialUser, phoneSocialCredentials.getPhone(), phoneSocialCredentials.getReferralCode());
    }

    public void connect(User user, String accessToken) {
        SocialUser socialUser = getSocialUser(accessToken);

        socialConnectionService.connect(socialUser, user);
    }

    private FacebookUserProfile getFacebookUserProfile(String accessToken) throws ThirdPartyException {
        FacebookUserProfile facebookUserProfile;
        try {
            URIBuilder uriBuilder = new URIBuilder("https://graph.facebook.com/" + FB_API_VERSION + "/me");
            uriBuilder.setParameter("access_token", accessToken);
            uriBuilder.setParameter("fields", "name,email,last_name,first_name,picture");
            facebookUserProfile = getDataFromFacebookApi(uriBuilder);
        } catch (URISyntaxException | IOException e) {
            String message = e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }

        return facebookUserProfile;
    }

    private FacebookUserProfile getDataFromFacebookApi(URIBuilder uriBuilder) throws ThirdPartyException, URISyntaxException, IOException {
        HttpUriRequest request = RequestBuilder.get()
            .setUri(uriBuilder.build())
            .build();

        HttpResponse response;
        try {
            response = client.execute(request);
        } catch (IOException e) {
            String message = "Error while executing request to Facebook API. " + e.getMessage();
            log.error(message, e);
            throw new ThirdPartyException(message);
        }

        FacebookUserProfile userProfile;
        int statusCode;
        statusCode = response.getStatusLine().getStatusCode();
        String result = EntityUtils.toString(response.getEntity());
        userProfile = SerializationUtil.fromJson(new TypeReference<FacebookUserProfile>() {
        }, result);

        if (statusCode != 200) {
            String message = "Error in request to Facebook API with statusCode " + statusCode + ". " + response.getStatusLine().getReasonPhrase();
            log.error(message);
            throw new ThirdPartyException(message);
        }

        return userProfile;
    }

    private SocialUser getSocialUser(String accessToken) throws AuthenticationRequiredException {
        FacebookUserProfile userProfile;
        try {
            userProfile = getFacebookUserProfile(accessToken);
        } catch (ThirdPartyException e) {
            log.error("Could not connect to facebook api", e);
            throw new AuthenticationRequiredException("Could not connect to facebook api", e);
        }

        return new SocialUser(userProfile);
    }
}
