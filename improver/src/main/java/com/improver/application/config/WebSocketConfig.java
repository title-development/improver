package com.improver.application.config;

import com.improver.application.properties.SecurityProperties;
import com.improver.ws.interceptors.WsSecurityInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

import static com.improver.application.properties.Path.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired private SecurityProperties securityProperties;

    /**
     * Configuration of WebSocket server container
     * sets connection timeout  to custom value as a Heroku container set this value to 55 seconds
     */
    @Bean
    public ServletServerContainerFactoryBean servletServerContainerFactoryBean() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxSessionIdleTimeout(securityProperties.wsConnectionIdleMillis());
        return container;
    }

    @Bean
    public WsSecurityInterceptor authStompInterceptor() {
        return new WsSecurityInterceptor();
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.setApplicationDestinationPrefixes(WS_APP)
        .enableSimpleBroker(WS_TOPIC, WS_QUEUE);
    }


    @Override
    public void configureClientInboundChannel(final ChannelRegistration registration) {
        registration.interceptors(authStompInterceptor());

    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint(WEB_SOCKET_ENDPOINT)
            .setAllowedOrigins("*")
            //.setHandshakeHandler(new PrincipalHandshakeHandler())
            //.addInterceptors(new WebSocketHandshakeInterceptor())
        ;

    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        //registration.addDecoratorFactory(LogWsHandlerDecorator::new) // for debug purposes
        ;
    }












}
