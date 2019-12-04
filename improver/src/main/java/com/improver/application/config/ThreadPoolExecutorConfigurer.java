package com.improver.application.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbc.JdbcLockProvider;
import net.javacrumbs.shedlock.spring.ScheduledLockConfiguration;
import net.javacrumbs.shedlock.spring.ScheduledLockConfigurationBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ConcurrentTaskExecutor;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

import javax.sql.DataSource;
import java.time.Duration;
import java.util.concurrent.Executor;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadPoolExecutor;


@EnableAsync
@EnableScheduling
@Configuration
public class ThreadPoolExecutorConfigurer implements AsyncConfigurer {

    @Value("${executor.async.pool.size}") private int asyncExecutorsPoolSize;
    @Value("${executor.scheduled.pool.size}") private int scheduledExecutorsPoolSize;


    @Override
    public ThreadPoolTaskExecutor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(asyncExecutorsPoolSize);
        executor.setAllowCoreThreadTimeOut(true);
        executor.setQueueCapacity(asyncExecutorsPoolSize);
        executor.setMaxPoolSize(asyncExecutorsPoolSize * 2);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }


    @Bean
    public ScheduledThreadPoolExecutor scheduledThreadPoolExecutor(){
        return new ScheduledThreadPoolExecutor(scheduledExecutorsPoolSize);
    }



    @Bean
    public ScheduledLockConfiguration taskScheduler(LockProvider lockProvider, ScheduledThreadPoolExecutor scheduledThreadPoolExecutor) {
        return ScheduledLockConfigurationBuilder
            .withLockProvider(lockProvider)
            .withExecutorService(scheduledThreadPoolExecutor)
            .withDefaultLockAtMostFor(Duration.ofMinutes(1))
            .build();
    }



    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcLockProvider(dataSource);
    }


}
