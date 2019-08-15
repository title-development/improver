package com.improver.application.properties;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class ThirdPartyApis {

    @Value("${google.auth.client.id}") private String googleClientId;
    @Value("${shippo.private.key}") private String shippoPrivateKey;
    @Value("${google.auth.client.id}") private String googleAuthClientId;
    @Value("${google.api.key}") private String googleApiKey;
    @Value("${mapreflex.api.key}") private String mapreflexApiKey;
    @Value("${stripe.secret.key}") private String stripeSecretKey;

}
