package com.improver.security;

import com.improver.entity.User;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.SpringSecurityCoreVersion;
import org.springframework.security.core.authority.AuthorityUtils;

import java.util.Collection;

public class JwtPrincipal extends AbstractAuthenticationToken {
    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;
    private static final String ROLE_PREFIX = "ROLE_";

    private final String email;


    public JwtPrincipal(String email, String role) {
        this(email, AuthorityUtils.createAuthorityList(ROLE_PREFIX + role));
    }



    /**
     * This constructor should only be used by <code>AuthenticationManager</code> or
     * <code>AuthenticationProvider</code> implementations that are satisfied with
     * producing a trusted (i.e. {@link #isAuthenticated()} = <code>true</code>)
     * authentication token.
     *
     * Handles {@link User.Role#INCOMPLETE_PRO} activation scenario.
     *
     * @param email
     * @param authorities
     */
    private JwtPrincipal(String email, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.email = email;
        super.setAuthenticated(true);
    }


    public Object getCredentials() {
        return null;
    }

    public Object getPrincipal() {
        return this.email;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        if (isAuthenticated) {
            throw new IllegalArgumentException(
                "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        }

        super.setAuthenticated(false);
    }

    public User.Role getRole(){
       return getAuthorities().stream()
           .filter(authority -> authority.getAuthority().startsWith(ROLE_PREFIX))
            .findFirst()
           .map(authority -> User.Role.valueOf(authority.getAuthority().replace(ROLE_PREFIX, "")))
            .orElseThrow(IllegalArgumentException::new);
    }
}
