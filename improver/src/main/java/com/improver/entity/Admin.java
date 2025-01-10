package com.improver.entity;

import com.improver.model.in.registration.UserRegistration;
import com.improver.model.admin.out.Record;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import java.time.ZonedDateTime;


@SqlResultSetMappings({
    @SqlResultSetMapping(name = "StatisticDate", classes = {
        @ConstructorResult(targetClass = Record.class,
            columns = {
                @ColumnResult(name = "amount", type = Long.class),
                @ColumnResult(name = "date", type = ZonedDateTime.class),
                @ColumnResult(name = "type", type = String.class),
            })
    })
})

@Data
@EqualsAndHashCode(callSuper = true)
@Accessors(chain = true)
@DiscriminatorValue("ADMIN")
@Entity(name = "admins")
@NoArgsConstructor
public class Admin extends Staff {




    public Admin(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }

    @Override
    public Role getRole() {
        return Role.ADMIN;
    }

    @Override
    public Admin setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Admin setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Admin setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Admin setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Admin setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }

    @Override
    public Admin setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Admin setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Admin setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Admin setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Admin setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }
}
