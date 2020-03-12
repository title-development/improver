package com.improver.test;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.ZoneId;
import java.util.concurrent.ThreadLocalRandom;

public class TestDateUtil {

    private TestDateUtil() {
    }


    public static ZonedDateTime randomDateFrom(ZonedDateTime startDate) {
        return randomDateBetween(startDate, ZonedDateTime.now());
    }

    public static ZonedDateTime randomDateBetween(ZonedDateTime startDate, ZonedDateTime endDate) {
        long randomDateInMilliSeconds = ThreadLocalRandom.current().nextLong(toMillisec(startDate), toMillisec(endDate));
        return ZonedDateTime.ofInstant(Instant.ofEpochMilli(randomDateInMilliSeconds), ZoneId.systemDefault());
    }

    private static long toMillisec(ZonedDateTime localDateTime) {
        return localDateTime.toInstant().toEpochMilli();
    }
}
