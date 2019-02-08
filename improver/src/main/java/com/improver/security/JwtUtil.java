package com.improver.security;

import com.improver.exception.ValidationException;
import com.improver.util.StringUtil;
import io.jsonwebtoken.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.CredentialsExpiredException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import java.util.Date;

import static com.improver.security.SecurityProperties.*;
import static com.improver.util.ErrorMessages.INVALID_ACTIVATION_LINK;

@Slf4j
@Component
public class JwtUtil {

    private static final String ROLE_CLAIM = "role";

    @Value("${jwt.secret}") private String secret;



    String generateAccessJWT(Authentication authentication) {
        return generateAccessJWT(authentication.getName(), authentication.getAuthorities().toArray()[0].toString());
    }

    String generateAccessJWT(String email, String role){
        return Jwts.builder()
            .claim(ROLE_CLAIM, role)
            .setSubject(email)
            .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRATION))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }


    /**
     * @param token - access JWT
     * @return JwtPrincipal
     * @throws CredentialsExpiredException - when token has been expired
     * @throws BadCredentialsException     - when token is malformed or not valid
     */
    @Deprecated
    //TODO : Misha change CredentialsExpiredException -> ExpiredJwtException. throw checked exceptions
    public JwtPrincipal parseAccessToken(String token) throws CredentialsExpiredException, BadCredentialsException {
        if (token == null) {
            throw new BadCredentialsException("Token is NULL");
        }
        Claims body;
        try {
            body = Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
        } catch (SignatureException | MalformedJwtException | UnsupportedJwtException e) {
            throw new BadCredentialsException("Invalid token", e);
        } catch (ExpiredJwtException e){
            throw new CredentialsExpiredException(e.getMessage());
        }

        String user = body.getSubject();
        String role = body.get(ROLE_CLAIM, String.class);
        if(StringUtil.isNullOrEmpty(user) || StringUtil.isNullOrEmpty(role)) {
            throw new BadCredentialsException("Invalid token: user/role is empty");
        }
        return new JwtPrincipal(user, role);
    }


    public String generateActivationJWT(String validationKey, String email) {
        return Jwts.builder()
            .setId(validationKey)
            .setSubject(email)
            .setExpiration(new Date(System.currentTimeMillis() + ACTIVATION_LINK_EXPIRATION))
            .signWith(SignatureAlgorithm.HS512, secret)
            .compact();
    }

    public String parseActivationJWT(String token, String userEmail) {
        if (token == null) {
            throw new ValidationException("Token is missing");
        }
        String validationKey;
        Claims body;
        try {
            body = Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
        } catch (ExpiredJwtException e) {
            log.warn("The token is expired and not valid anymore", e);
            throw new ValidationException("Activation link is expired");
        } catch (JwtException e) {
            log.error("Invalid Token", e);
            throw new ValidationException(INVALID_ACTIVATION_LINK);
        }

        String user = body.getSubject();
        if (user == null || user.isEmpty()){
            log.error("Activation link contains incorrect username={}", user);
            throw new ValidationException(INVALID_ACTIVATION_LINK);
        }

        validationKey = body.getId();
        if (validationKey == null || validationKey.isEmpty()){
            log.error("Activation link contains incorrect key={}", validationKey);
            throw new ValidationException(INVALID_ACTIVATION_LINK);
        }

        return validationKey;
    }
}
