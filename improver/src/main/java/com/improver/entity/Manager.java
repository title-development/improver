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
@DiscriminatorValue("MANAGER")
@Entity(name = "admins")
@NoArgsConstructor
public class Manager extends User {





    public Manager(UserRegistration reg) {
        super(reg);
    }

    public Manager(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }




    @Override
    public Role getRole() {
        return Role.MANAGER;
    }

    @Override
    public Manager setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Manager setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Manager setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Manager setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Manager setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }


    @Override
    public Manager setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Manager setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Manager setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Manager setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Manager setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }
}
