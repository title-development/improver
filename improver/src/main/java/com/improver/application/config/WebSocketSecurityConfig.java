package com.improver.application.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

import static com.improver.application.properties.Path.*;
import static org.springframework.messaging.simp.SimpMessageType.*;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

	@Override
	protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .simpTypeMatchers(CONNECT, UNSUBSCRIBE, DISCONNECT).permitAll()
            // Any message without a destination (i.e. anything other than Message type of MESSAGE or SUBSCRIBE) will require the user to be authenticated
            // works only on handshake
            .nullDestMatcher().authenticated()


            // Notifications
            .simpSubscribeDestMatchers(WS_QUEUE_USERS + "/**").authenticated()
            .simpDestMatchers(WS_APP_USERS + "/**").authenticated()

            // Chat
            .simpSubscribeDestMatchers(WS_TOPIC_PROJECT_REQUESTS + "/**").hasAnyRole("CONTRACTOR", "CUSTOMER")
            .simpDestMatchers(WS_APP_PROJECT_REQUESTS + "/**").hasAnyRole("CONTRACTOR", "CUSTOMER")

            .simpTypeMatchers(MESSAGE, SUBSCRIBE).denyAll()
            .anyMessage().denyAll()

        ;
	}



	@Override
	protected boolean sameOriginDisabled() {
		//disable CSRF for websockets because we do not use HTTP sessions
        return true;
	}
}
