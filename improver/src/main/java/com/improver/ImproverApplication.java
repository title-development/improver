package com.improver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;


/**
 * Entry point into Spring Boot application.
 *
 */
@SpringBootApplication(scanBasePackages={"com.improver"})
@EntityScan("com.improver.entity")
@EnableJpaRepositories(basePackages= "com.improver.repository")
@EnableScheduling
@EnableAsync
@EnableTransactionManagement
public class ImproverApplication {

	public static void main(String[] args) {
		SpringApplication.run(ImproverApplication.class, args);
	}

}
