package com.improver.application.properties;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;


@Component
public class SecurityProperties {

    public static final String REFRESH_COOKIE_NAME = "imp-ref";

    @Getter
    @Value("${security.token.jwt.secret}")
    private String jwtSecret;
    @Value("${security.token.access.expiration}")
    private Duration accessTokenDuration;
    @Value("${security.token.refresh.expiration}")
    private Duration refreshTokenDuration;
    @Value("${security.login-session.idle}")
    private Duration userSessionIdle;
    @Value("${security.token.activation.expiration}")
    private Duration activationTokenDuration;
    @Value("${security.ws.connection.idle}")
    private Duration wsConnectionDuration;


    public long accessTokenExpiration() {
        return accessTokenDuration.toMillis();
    }

    public long refreshTokenExpiration() {
        return refreshTokenDuration.toMillis();
    }

    public long maxUserSessionIdle() {
        return refreshTokenDuration.plus(userSessionIdle).toMillis();
    }

    public long activationLinkExpiration() {
        return activationTokenDuration.toMillis();
    }

    public long wsConnectionIdleMillis() {
        return wsConnectionDuration.toMillis();
    }
}
