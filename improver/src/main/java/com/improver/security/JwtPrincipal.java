package com.improver.security;

import com.improver.entity.User;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.SpringSecurityCoreVersion;
import org.springframework.security.core.authority.AuthorityUtils;

import java.util.Collection;

public class JwtPrincipal extends AbstractAuthenticationToken {

    private static final long serialVersionUID = SpringSecurityCoreVersion.SERIAL_VERSION_UID;

    private final Object principal;
    private Object credentials;



    public JwtPrincipal(Object principal, String role) {
        this(principal, AuthorityUtils.createAuthorityList("ROLE_" + role));
    }



    /**
     * This constructor should only be used by <code>AuthenticationManager</code> or
     * <code>AuthenticationProvider</code> implementations that are satisfied with
     * producing a trusted (i.e. {@link #isAuthenticated()} = <code>true</code>)
     * authentication token.
     *
     * @param principal
     * @param authorities
     */
    public JwtPrincipal(Object principal, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = null;
        super.setAuthenticated(true); // must use super, as we override
    }



    public Object getCredentials() {
        return this.credentials;
    }

    public Object getPrincipal() {
        return this.principal;
    }

    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        if (isAuthenticated) {
            throw new IllegalArgumentException(
                "Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        }

        super.setAuthenticated(false);
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        credentials = null;
    }

    public User.Role getRole(){
       return getAuthorities().stream()
            .filter(authority -> authority.getAuthority().startsWith("ROLE_"))
            .findFirst()
            .map(authority -> User.Role.valueOf(authority.getAuthority().replace("ROLE_", "")))
            .orElseThrow(IllegalArgumentException::new);
    }
}
