package com.improver.application.properties;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class ThirdPartyApis {

    @Value("${account.shippo.private.key}")
    private String shippoPrivateKey;
    @Value("${account.google.auth.client.id}")
    private String googleAuthClientId;
    @Value("${account.google.map.api.key}")
    private String googleApiKey;
    @Value("${account.mapreflex.api.key}")
    private String mapreflexApiKey;
    @Value("${account.stripe.secret.key}")
    private String stripeSecretKey;

}
