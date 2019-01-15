package com.improver.entity;

import com.improver.model.in.registration.UserRegistration;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import java.time.ZonedDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@Accessors(chain = true)
@DiscriminatorValue("SUPPORT")
@Entity(name = "supports")
@NoArgsConstructor
public class Support extends User {


    public Support(UserRegistration reg) {
        super(reg);
    }

    public Support(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }

    @Override
    public Role getRole() {
        return Role.SUPPORT;
    }

    @Override
    public Support setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Support setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Support setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Support setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Support setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }

    @Override
    public Support setDisplayName(String displayName) {
        super.setDisplayName(displayName);
        return this;
    }

    @Override
    public Support setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Support setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Support setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Support setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Support setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }
}
