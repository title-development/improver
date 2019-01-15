package com.improver.util;

import java.util.regex.Pattern;

public final class StringUtil {

    private StringUtil() {
    }

    public static boolean isNullOrEmpty(String string) {
        return null == string || string.isEmpty();
    }

    public static String capitalize(String str) {
        if (isNullOrEmpty(str)) {
            return "";
        }
        String regexp = "\\s";
        Pattern pattern = Pattern.compile(regexp);
        String words[] = pattern.split(str.toLowerCase());
        String capitalizeWord = "";
        for (String w : words) {
            String first = w.substring(0, 1);
            String afterFirst = w.substring(1);
            capitalizeWord += first.toUpperCase() + afterFirst + " ";
        }
        return capitalizeWord.trim();
    }
}
