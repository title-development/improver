package com.improver.security;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static com.improver.application.properties.Path.REFRESH_COOKIE_PATH;
import static com.improver.application.properties.SecurityProperties.*;

public class CookieHelper {

    public static Cookie buildRefreshCookie(String refreshToken, long refreshTokenExpiration) {
        return newCookie(REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_PATH, Math.toIntExact(refreshTokenExpiration / 1000));
    }


    public static void eraseRefreshCookie(HttpServletResponse response) {
        Cookie cookie = newCookie(REFRESH_COOKIE_NAME, null, REFRESH_COOKIE_PATH, 0);
        response.addCookie(cookie);
    }

    public static String getRefreshTokenFromCookie(HttpServletRequest request){
        Cookie cookie = getCookie(request, REFRESH_COOKIE_NAME);
        if(cookie == null) {
            return null;
        }
        return cookie.getValue();
    }



    private static Cookie getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) {
            return null;
        }
        for (int i = 0; i < request.getCookies().length; i++) {
            if (request.getCookies()[i].getName().equals(name)) {
                return request.getCookies()[i];
            }
        }
        return null;
    }


    private static Cookie newCookie(String name, String data, String domain, int maxAge) {
        Cookie cookie = new Cookie(name, data);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath(domain);
        cookie.setMaxAge(maxAge);
        return cookie;
    }

}
