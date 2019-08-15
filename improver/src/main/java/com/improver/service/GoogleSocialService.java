package com.improver.service;

import com.google.api.client.auth.openidconnect.IdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.model.socials.PhoneSocialCredentials;
import com.improver.model.socials.SocialUser;
import com.improver.application.properties.ThirdPartyApis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class GoogleSocialService {

    @Autowired private SocialConnectionService socialConnectionService;
    @Autowired private ThirdPartyApis thirdPartyApis;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(thirdPartyApis.getGoogleAuthClientId()))
            .build();
    }

    public User loginOrRegister(String idTokenString) {
        SocialUser socialUser = getSocialUser(idTokenString);

        return socialConnectionService.findExistingOrRegister(socialUser);
    }

    public User registerPro(PhoneSocialCredentials phoneSocialCredentials) {
        SocialUser socialUser = getSocialUser(phoneSocialCredentials.getAccessToken());

        return socialConnectionService.registerPro(socialUser, phoneSocialCredentials.getPhone(), phoneSocialCredentials.getReferralCode());
    }

    public void connect(User user, String idTokenString) {
        SocialUser socialUser = getSocialUser(idTokenString);

        socialConnectionService.connect(socialUser, user);
    }

    private SocialUser getSocialUser(String idTokenString) {
        GoogleIdToken idToken = null;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (GeneralSecurityException e) {
            throw new AuthenticationRequiredException("Token id is invalid");
        } catch (IOException e) {
            throw new AuthenticationRequiredException("Could not connect to google api");
        }
        if (idToken == null) {
            throw new AuthenticationRequiredException("Could not connect to google api");
        }
        IdToken.Payload payload = idToken.getPayload();

        return new SocialUser(payload);
    }
}
