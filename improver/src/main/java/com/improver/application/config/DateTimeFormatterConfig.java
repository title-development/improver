package com.improver.application.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.expression.ParseException;
import org.springframework.format.Formatter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Configuration
public class DateTimeFormatterConfig {

    @Bean
    public Formatter<LocalDate> localDateFormatter() {
        return new Formatter<>() {
            @Override
            public LocalDate parse(String text, Locale locale) throws ParseException {
                return LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE);
            }

            @Override
            public String print(LocalDate object, Locale locale) {
                return DateTimeFormatter.ISO_LOCAL_DATE.format(object);
            }
        };
    }

    @Bean
    public Formatter<LocalDateTime> localDateTimeFormatter() {
        return new Formatter<>() {
            @Override
            public LocalDateTime parse(String text, Locale locale) throws ParseException {
                return LocalDateTime.parse(text, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }

            @Override
            public String print(LocalDateTime object, Locale locale) {
                return DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(object);
            }
        };
    }

    @Bean
    public Formatter<ZonedDateTime> zonedDateTimeFormatter() {
        return new Formatter<>() {
            @Override
            public ZonedDateTime parse(String text, Locale locale) throws ParseException {
                return ZonedDateTime.parse(text, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            }

            @Override
            public String print(ZonedDateTime object, Locale locale) {
                return DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(object);
            }
        };
    }

}
