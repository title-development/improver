package com.improver.application.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbc.JdbcLockProvider;
import net.javacrumbs.shedlock.spring.ScheduledLockConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import net.javacrumbs.shedlock.spring.ScheduledLockConfigurationBuilder;

import javax.sql.DataSource;

@Configuration
public class ScheduledLockConfig {

    @Value("${executor.scheduled.pool.size}") private int scheduledExecutorsPoolSize;
    private static final int DEFAULT_LOCK_AT_MOST_FOR_MINUTES = 10;

    @Bean
    public ScheduledLockConfiguration taskScheduler(LockProvider lockProvider) {
        return ScheduledLockConfigurationBuilder
            .withLockProvider(lockProvider)
            .withPoolSize(scheduledExecutorsPoolSize)
            .withDefaultLockAtMostFor(Duration.ofMinutes(DEFAULT_LOCK_AT_MOST_FOR_MINUTES))
            .build();
    }

    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcLockProvider(dataSource);
    }

}
