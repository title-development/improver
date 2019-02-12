package com.improver.security;

import com.improver.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.List;


public class UserDetailsImpl implements UserDetails {

    private final String username;
    private final String password;
    private final boolean isAccountNonExpired;
    private final boolean isAccountNonLocked;
    private final boolean isCredentialsNonExpired;
    private boolean isEnabled;
    private final List<SimpleGrantedAuthority> authorities;

    public UserDetailsImpl(User user) {
        this.username = user.getEmail();
        this.password = user.getPassword();
        this.isCredentialsNonExpired = true;
        this.isAccountNonExpired = !user.isDeleted();
        this.isAccountNonLocked = !user.isBlocked();
        this.isEnabled = user.isActivated();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(user.getRole().toString()));
    }

    private UserDetailsImpl(User user, boolean activated) {
        this(user);
        this.isEnabled = activated;
    }

    public static UserDetailsImpl incompletePro(User user) {
        return new UserDetailsImpl(user, true);
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return isAccountNonExpired;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isAccountNonLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return isCredentialsNonExpired;
    }

    @Override
    public boolean isEnabled() {
        return isEnabled;
    }

    @Override
    public List<SimpleGrantedAuthority> getAuthorities() {
        return authorities;
    }
}
