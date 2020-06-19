package com.improver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.TimeZone;

/**
 * Entry point into Spring Boot application.
 *
 */
@SpringBootApplication(scanBasePackages={"com.improver"})
@EntityScan("com.improver.entity")
@EnableJpaRepositories(basePackages= "com.improver.repository")
@EnableTransactionManagement
public class ImproverApplication {

	public static void main(String[] args) {
        //TODO: Mykhailo Soltys finish this
	    //TimeZone.setDefault(TimeZone.getTimeZone("EST"));
		SpringApplication.run(ImproverApplication.class, args);
	}

}
