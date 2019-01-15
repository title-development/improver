package com.improver.service;

import com.google.api.client.auth.openidconnect.IdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.improver.entity.SocialConnection;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.model.socials.SocialUser;
import com.improver.util.ThirdPartyApis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    public User login(String idTokenString) {
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

        SocialUser socialUser = new SocialUser()
            .setId(payload.getSubject())
            .setEmail((String) payload.get("email"))
            .setFirstName(payload.get("given_name").toString())
            .setLastName(payload.get("family_name").toString())
            .setPicture((String) payload.get("picture"));

        return socialConnectionService.authorize(socialUser, SocialConnection.Provider.GOOGLE);
    }

    public void connect(String idTokenString) {
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

        SocialUser socialUser = new SocialUser()
            .setId(payload.getSubject())
            .setEmail((String) payload.get("email"))
            .setFirstName(payload.get("given_name").toString())
            .setLastName(payload.get("family_name").toString())
            .setPicture((String) payload.get("picture"));

        socialConnectionService.connect(socialUser, SocialConnection.Provider.GOOGLE);
    }
}
