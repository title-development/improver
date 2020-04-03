package com.improver.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.NotFoundException;
import com.improver.exception.ThirdPartyException;
import com.improver.model.out.LoginModel;
import com.improver.model.socials.FacebookUserProfile;
import com.improver.model.socials.SocialUserInfo;
import com.improver.model.socials.SocialUser;
import com.improver.security.UserSecurityService;
import com.improver.util.serializer.SerializationUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.client.utils.URIBuilder;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URISyntaxException;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

@Slf4j
@Service
public class FacebookSocialService {

    private static final String FB_API_VERSION = "v3.1";

    @Autowired private SocialConnectionService socialConnectionService;
    @Autowired private UserSecurityService userSecurityService;
    private HttpClient client;


    @PostConstruct
    public void init() {
        client = HttpClientBuilder
            .create()
            .build();
    }

    public LoginModel login(String authToken, HttpServletResponse res) {
        SocialUser socialUser = getSocialUser(authToken);
        User user = socialConnectionService.findExistingUser(socialUser);
        if (isNull(user)) {
            throw new NotFoundException("User is not found");
        }
        userSecurityService.checkUser(user);
        return userSecurityService.performUserLogin(user, res);
    }

    public LoginModel register(SocialUserInfo socialUserInfo, HttpServletResponse res) {
        LoginModel loginModel = null;
        boolean socialProfileHasEmail = true;
        SocialUser socialUser = getSocialUser(socialUserInfo.getAccessToken());
        if (isNull(socialUser.getEmail())) {
            socialUser.setEmail(socialUserInfo.getEmail());
            socialProfileHasEmail = false;
        }
        User user = socialConnectionService.registerUser(socialUser, !socialProfileHasEmail);
        if (socialProfileHasEmail) {
            loginModel = userSecurityService.performUserLogin(user, res);
        }
        return loginModel;
    }

    public User registerPro(SocialUserInfo socialUserInfo) {
        SocialUser socialUser = getSocialUser(socialUserInfo.getAccessToken());
        return socialConnectionService.registerPro(socialUser, socialUserInfo, socialUserInfo.getReferralCode());
    }


    public void connect(User user, String accessToken) {
        SocialUser socialUser = getSocialUser(accessToken);
        socialConnectionService.connect(socialUser, user);
    }


    private SocialUser getSocialUser(String accessToken) throws AuthenticationRequiredException {
        FacebookUserProfile userProfile;
        try {
            userProfile = getFacebookUserProfile(accessToken);
        } catch (ThirdPartyException e) {
            log.error(e.getMessage(), e);
            throw new AuthenticationRequiredException("Could not connect to Facebook API", e);
        }
        return new SocialUser(userProfile);
    }


    private FacebookUserProfile getFacebookUserProfile(String accessToken) throws ThirdPartyException {
        FacebookUserProfile facebookUserProfile;
        try {
            URIBuilder uriBuilder = new URIBuilder("https://graph.facebook.com/" + FB_API_VERSION + "/me");
            uriBuilder.setParameter("access_token", accessToken);
            uriBuilder.setParameter("fields", "name,email,last_name,first_name,picture");
            HttpUriRequest request = RequestBuilder.get()
                .setUri(uriBuilder.build())
                .build();
            facebookUserProfile = getDataFromFacebookApi(request);
        } catch (URISyntaxException e) {
            // should never be here
            throw new IllegalArgumentException("Error while building request to facebook.", e);
        }
        return facebookUserProfile;
    }


    private FacebookUserProfile getDataFromFacebookApi(HttpUriRequest request) throws ThirdPartyException {
        HttpResponse response;
        try {
            response = client.execute(request);
        } catch (IOException e) {
            String message = "Error while executing request to Facebook API. Reason: " + e.getMessage();
            throw new ThirdPartyException(message);
        }

        FacebookUserProfile userProfile;
        int statusCode = response.getStatusLine().getStatusCode();
        if (statusCode != 200) {
            String message = "Error in request to Facebook API with statusCode=" + statusCode + ". Reason: "
                + response.getStatusLine().getReasonPhrase();
            throw new ThirdPartyException(message);
        }

        try {
            String result = EntityUtils.toString(response.getEntity());
            userProfile = SerializationUtil.fromJson(new TypeReference<>() {}, result);
        } catch (Exception e) {
            throw new ThirdPartyException("Error parsing response from Facebook.", e);
        }
        return userProfile;
    }

}
