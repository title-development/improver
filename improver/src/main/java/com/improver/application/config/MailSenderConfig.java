package com.improver.application.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Slf4j
@Configuration
public class MailSenderConfig {

    @Value("${spring.mail.host}") private String host;
    @Value("${spring.mail.port}") private int port;
    @Value("${spring.mail.protocol}") private String protocol;
    @Value("${spring.mail.default-encoding}") private String defaultEncoding;
    @Value("${spring.mail.properties.mail.smtp.auth}") private boolean smtpAuth;
    @Value("${spring.mail.properties.mail.smtp.socketFactory.port}") private String smtpSocketFactoryPort;
    @Value("${spring.mail.properties.mail.smtp.socketFactory.class}") private String smtpSocketFactoryClass;
    @Value("${spring.mail.properties.mail.smtp.socketFactory.fallback}") private boolean smtpSocketFactoryFallback;
    @Value("${spring.mail.properties.mail.smtp.starttls.enable}") private boolean smtpStarttlsEnable;
    @Value("${spring.mail.properties.mail.smtp.ssl.enable}") private boolean smtpSslEnable;

    @Value("${mail.noreply.username}") private String noreplayEmailUsername;
    @Value("${mail.noreply.password}") private String noreplayEmailPassword;
    @Value("${mail.support.username}") private String supportEmailUsername;
    @Value("${mail.support.password}") private String supportEmailPassword;

    /**
     * Prepare basic mail sender bean configuration
     */
    private JavaMailSenderImpl preConfiguredMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setDefaultEncoding(defaultEncoding);
        mailSender.setProtocol(protocol);
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.properties.mail.smtp.auth", smtpAuth);
        props.put("mail.smtp.socketFactory.port", smtpSocketFactoryPort);
        props.put("mail.smtp.socketFactory.class", smtpSocketFactoryClass);
        props.put("mail.smtp.socketFactory.fallback", smtpSocketFactoryFallback);
        props.put("mail.smtp.starttls.enable", smtpStarttlsEnable);
        props.put("mail.smtp.ssl.enable", smtpSslEnable);
        return mailSender;
    }

    @Bean
    public JavaMailSender mailSenderSupport() {
        JavaMailSenderImpl mailSender = preConfiguredMailSender();
        mailSender.setUsername(supportEmailUsername);
        mailSender.setPassword(supportEmailPassword);
        return mailSender;
    }

    @Bean
    public JavaMailSender mailSenderNoreply() {
        JavaMailSenderImpl mailSender = preConfiguredMailSender();
        mailSender.setUsername(noreplayEmailUsername);
        mailSender.setPassword(noreplayEmailPassword);
        return mailSender;
    }

}
