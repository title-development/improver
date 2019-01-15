package com.improver.application.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

import static com.improver.application.properties.Path.WS_QUEUE;
import static com.improver.application.properties.Path.WS_TOPIC;
import static org.springframework.messaging.simp.SimpMessageType.MESSAGE;
import static org.springframework.messaging.simp.SimpMessageType.SUBSCRIBE;

@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

	@Override
	protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        // TODO users cannot send to these broker destinations, only the application can

        messages
            // Any message without a destination (i.e. anything other than Message type of MESSAGE or SUBSCRIBE) will require the user to be authenticated
            // works only on handshake
            //.nullDestMatcher().authenticated()

            // Only authenticated users can
            .simpSubscribeDestMatchers(WS_TOPIC + "/users/**").authenticated()

            // Chat
            .simpSubscribeDestMatchers(WS_TOPIC + "/projectRequests/**").hasAnyRole("CONTRACTOR", "CUSTOMER")
            .simpDestMatchers(WS_QUEUE + "/projectRequests/**").hasAnyRole("CONTRACTOR", "CUSTOMER")

            //.simpTypeMatchers(MESSAGE).denyAll()
            //.anyMessage().denyAll()

        ;
	}



	@Override
	protected boolean sameOriginDisabled() {
		//disable CSRF for websockets for now...
        return true;
	}
}
