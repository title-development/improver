package com.improver.application.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;


@Configuration
public class ExtendedApplicationContext {

    @Value("${executor.async.pool.size}") private int asyncExecutorsPoolSize;

    /**
     * Task executor for @Async methods
     */
    @Bean
    public TaskExecutor taskExecutor() {
        SimpleAsyncTaskExecutor asyncExecutor = new SimpleAsyncTaskExecutor("asyncExecutor-");
        asyncExecutor.setConcurrencyLimit(asyncExecutorsPoolSize);
        return asyncExecutor;
    }

}
