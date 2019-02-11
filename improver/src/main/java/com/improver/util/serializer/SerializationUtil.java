package com.improver.util.serializer;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.util.regex.Pattern;


public class SerializationUtil {

    private SerializationUtil() {
    }

    /**
     * Allow
     * pattern: xxx-xxx-xxxx
     * 223-456-7890
     * all phone numbers start from 2
     * and empty string
     */
    public static final String PHONE_PATTERN_STRING = "(^[2-9]\\d{2}-\\d{3}-\\d{4})|^$";
    public static final String ZIP_PATTERN_STRING = "\\d{5}";
    public static final String CITY_PATTERN_STRING ="^([a-zA-Z\\u0080-\\u024F]+(?:. |-| |'))*[a-zA-Z\\u0080-\\u024F]*$";

    /**
     * at least 8 characters
     * at least 1 numeric character
     * at least 1 lowercase or uppercase letter
     */
    public static final String PASS_PATTERN_STRING = "^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$";
    public static final Pattern PASS_PATTERN = Pattern.compile(PASS_PATTERN_STRING);

    /**
     * Reqex allow cyrillic
     * t2
     * Test
     * Test2
     * Test'test
     * Test test
     * Test'test test
     * Test test'test
     * Test test test
     * Test'test test-test
     * Demo https://regex101.com/r/ic0UPr/1
     */
    public static final String NAME_PATTERN_STRING = "^(?=.{2,}$)[a-zA-Z\\u00A1-\\uFFFF]+(?:[a-zA-Z0-9\\u00A1-\\uFFFF]|[-'\\s][a-zA-Z0-9\\u00A1-\\uFFFF]+)*$";
    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd'T'HH:mm:ssxxx";
    public static final String DATE_PATTERN = "yyyy-MM-dd";
    public static final Pattern NUMERIC_PATTERN = Pattern.compile("\\d+");
    private static final ObjectMapper objectMapper = new ObjectMapper();

    static {
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.NONE);
        objectMapper.setVisibility(PropertyAccessor.GETTER, JsonAutoDetect.Visibility.PUBLIC_ONLY);
        objectMapper.setVisibility(PropertyAccessor.SETTER, JsonAutoDetect.Visibility.PUBLIC_ONLY);
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }


    public static ObjectMapper mapper() {
        return objectMapper;
    }

    public static String jsonWithEscapes(Object object) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Could not serialize object=" + object);
        }

    }

    public static String toJson(Object object) {
        try {
            return new String(objectMapper.writeValueAsBytes(object));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Could not serialize object=" + object);
        }
    }

    public static <T> T fromJson(final TypeReference<T> type, final String jsonPacket) {
        if(jsonPacket == null || jsonPacket.isEmpty()) {
            return null;
        }
        T data = null;
        try {
            data = objectMapper.readValue(jsonPacket, type);
        } catch (IOException e) {
            throw new RuntimeException("Could not deserialize string");
        }
        return data;
    }

    public static String centsToUsd(int cents) {
        return String.format("%.2f", (double) cents/100);
    }

    public static String formatUsd(int cents) {
        return "$" + centsToUsd(cents) + " USD";
    }

}
