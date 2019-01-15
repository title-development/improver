package com.improver.entity;

import com.improver.model.in.registration.StaffRegistration;
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
@DiscriminatorValue("STAKEHOLDER")
@Entity(name = "stakeholders")
@NoArgsConstructor
public class Stakeholder extends User {
    public Stakeholder(StaffRegistration registration) {
        super(registration.getFirstName(), registration.getLastName(), registration.getEmail(), registration.getPassword(), registration.getPhone());
    }

    public Stakeholder(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }

    @Override
    public Role getRole() {
        return Role.STAKEHOLDER;
    }

    @Override
    public Stakeholder setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Stakeholder setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Stakeholder setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Stakeholder setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Stakeholder setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }

    @Override
    public Stakeholder setDisplayName(String displayName) {
        super.setDisplayName(displayName);
        return this;
    }

    @Override
    public Stakeholder setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Stakeholder setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Stakeholder setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Stakeholder setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Stakeholder setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }
}
