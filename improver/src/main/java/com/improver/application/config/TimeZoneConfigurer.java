package com.improver.application.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

import static com.improver.application.properties.Environments.*;


@Configuration
public class TimeZoneConfigurer {

    @Value("${custom.application.timezone}") private String timeZone;

    @PostConstruct
    public void init(){
        // Setting Spring Boot SetTimeZone
         TimeZone.setDefault(TimeZone.getTimeZone(timeZone));
    }
}
