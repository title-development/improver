package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.socials.SocialUser;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.Accessors;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Embeddable;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import java.time.ZonedDateTime;
import java.util.List;


@Entity(name = "customers")
@DiscriminatorValue("CUSTOMER")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(exclude = {"projects", "reviews"})
@Accessors(chain = true)
@NoArgsConstructor
public class Customer extends User {

    @JsonIgnore
    @OneToMany(mappedBy = "customer")
    private List<Project> projects;

    @JsonIgnore
    @OneToMany(mappedBy = "customer")
    private List<Review> reviews;

    @Embedded
    private MailSettings mailSettings = new MailSettings();

    @Embeddable
    @Data
    public static class MailSettings {
        //Order Lifecycle
        //Email notification on order request, close, cancel, etc
        private boolean isProjectLifecycle = true;

        //Pro requests
        //Receive emails when PRO sent you project request
        private boolean isProRequests = true;

        //Marketing
        //Receive emails regarding product and special offers from Home Improve
        private boolean isMarketing = true;
    }


    public Customer(UserRegistration reg) {
        super(reg);
    }

    public Customer(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }

    public static Customer of(SocialUser socialUser) {
        return new Customer()
            .setEmail(socialUser.getEmail())
            .setFirstName(socialUser.getFirstName())
            .setLastName(socialUser.getLastName())
            .setActivated(true)
            .setCreated(ZonedDateTime.now())
            .setIconUrl(socialUser.getPicture());
    }

    @Override
    public Role getRole() {
        return Role.CUSTOMER;
    }

    @Override
    public Customer setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Customer setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Customer setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Customer setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Customer setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }

    @Override
    public Customer setDisplayName(String displayName) {
        super.setDisplayName(displayName);
        return this;
    }

    @Override
    public Customer setInternalPhone(String phone) {
        super.setInternalPhone(phone);
        return this;
    }

    @Override
    public Customer setValidationKey(String validationKey) {
        super.setValidationKey(validationKey);
        return this;
    }

    @Override
    public Customer setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Customer setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Customer setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Customer setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Customer setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }


}
