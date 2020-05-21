package com.improver.util;


/**
 *  Alphabet for Base35
 *
 *  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | A  | B  | C  | D  | E  | F  | G  | H  | I  | J  | K  | L  | M  | N  | P  | Q  | R  | S  | T  | U  | V  | W  | X  | Y  | Z
 *  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34
 */
public class DecimalConverter {

    // all digits and all letters except letter 'O'
    private static final String ALPHABET = "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ";
    private static final int BASE = ALPHABET.length();  //35
    private static final int MAX_LENGTH = 13;           // based on Long.MAX_VALUE  in Base35 format


    public static String decimalToBaseX(long number) {
        long quot = number / BASE;
        int rem = (int) (number % BASE);
        char letter = ALPHABET.charAt(rem);
        if (quot == 0) {
            return "" + letter;
        } else {
            return decimalToBaseX(quot) + letter;
        }
    }

    public static long baseXToDecimal(String s) {
        if (s == null || s.length() > MAX_LENGTH) {
            throw new IllegalArgumentException("String length should not exceed " + MAX_LENGTH);
        }
        // reverse digits, so we can easily use reverse position as a weight of digit
        char[] chars = new StringBuilder(s).reverse().toString().toCharArray();
        long sum = 0;
        for (int weight = 0;  weight < chars.length; weight++) {
            int decimalEquivalent = ALPHABET.indexOf(chars[weight]);
            if (decimalEquivalent < 0) {
                throw new IllegalArgumentException("Letter '" + chars[weight] + "' does not belong to source alphabet");
            }
            long part = decimalEquivalent * (long) Math.pow(BASE, weight);
            sum += part;
        }
        return sum;
    }
}
