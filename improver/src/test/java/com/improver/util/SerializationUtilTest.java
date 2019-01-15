package com.improver.util;

import com.improver.util.serializer.SerializationUtil;
import org.junit.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class SerializationUtilTest {

    private Map<String, List<String>> detailsAsMap(){
        MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
        map.add("When do you need your project started?", "in 20 days");
        map.add("What type of property do you have?", "Office");
        map.add("Please provide some project details for Professional", "dunno");
        return map;
    }

    @Test
    public void testMapToJson(){
        String result = com.improver.util.serializer.SerializationUtil.jsonWithEscapes(detailsAsMap());
        System.out.println(result);
    }
}
