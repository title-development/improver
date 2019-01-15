package com.improver.application.config;

import com.improver.ws.interceptors.AuthStompInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

import static com.improver.application.properties.Path.WEB_SOCKET_ENDPOINT;
import static com.improver.application.properties.Path.WS_QUEUE;
import static com.improver.application.properties.Path.WS_TOPIC;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configuration of WebSocket server container
     * sets connection timeout  to custom value as a Heroku container set this value to 55 seconds
     */
    @Bean
    public ServletServerContainerFactoryBean servletServerContainerFactoryBean() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        container.setMaxSessionIdleTimeout(15 * 60 * 1000L);
        return container;
    }

    @Bean
    public AuthStompInterceptor authStompInterceptor(){
        return new AuthStompInterceptor();
    }


    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker(WS_TOPIC, WS_QUEUE); // TODO check this
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
        //registration.addDecoratorFactory(CustomWebSocketHandler::new) // for debug purposes
        ;
    }












}
