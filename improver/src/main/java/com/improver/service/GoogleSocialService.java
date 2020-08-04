package com.improver.service;

import com.google.api.client.auth.openidconnect.IdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.improver.application.properties.ThirdPartyApis;
import com.improver.entity.User;
import com.improver.exception.AuthenticationRequiredException;
import com.improver.exception.InternalServerException;
import com.improver.exception.NotFoundException;
import com.improver.model.out.LoginModel;
import com.improver.model.socials.SocialConnectionConfig;
import com.improver.model.socials.SocialUser;
import com.improver.security.UserSecurityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.security.GeneralSecurityException;
import java.util.Collections;

import static java.util.Objects.isNull;

@Slf4j
@Service
public class GoogleSocialService {

    @Autowired private SocialConnectionService socialConnectionService;
    @Autowired private ThirdPartyApis thirdPartyApis;
    @Autowired private UserSecurityService userSecurityService;
    private GoogleIdTokenVerifier verifier;


    @PostConstruct
    public void init() {
        verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(thirdPartyApis.getGoogleAuthClientId()))
            .build();
    }

    public LoginModel login(String idToken, HttpServletRequest req, HttpServletResponse res) {
        SocialUser socialUser = getSocialUser(idToken);
        User user = socialConnectionService.findExistingUser(socialUser);
        if (isNull(user)) {
            throw new NotFoundException("User is not found");
        }
        return userSecurityService.performUserLogin(user, req, res);
    }

    public User register(SocialConnectionConfig socialConnectionConfig) {
        SocialUser socialUser = getSocialUser(socialConnectionConfig.getAccessToken());
        return socialConnectionService.registerUser(socialUser, false, false);
    }

    public User registerPro(SocialConnectionConfig socialConnectionConfig) {
        SocialUser socialUser = getSocialUser(socialConnectionConfig.getAccessToken());
        return socialConnectionService.registerPro(socialUser, socialConnectionConfig, socialConnectionConfig.getReferralCode());
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
        } catch (Exception e) {
            log.error("Google api exception", e);
            throw new InternalServerException("Could not connect to google api", e);
        }
        if (idToken == null) {
            throw new AuthenticationRequiredException("Could not connect to google api");
        }
        IdToken.Payload payload = idToken.getPayload();

        return new SocialUser(payload);
    }
}
