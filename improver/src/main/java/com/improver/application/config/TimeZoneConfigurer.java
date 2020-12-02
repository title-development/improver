package com.improver.application.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

import static com.improver.application.properties.Environments.PROD;
import static com.improver.application.properties.Environments.QA;

@Profile({QA, PROD})
@Configuration
public class TimeZoneConfigurer {

    @PostConstruct
    public void init(){
        // Setting Spring Boot SetTimeZone
        TimeZone.setDefault(TimeZone.getTimeZone("EST"));
    }
}
