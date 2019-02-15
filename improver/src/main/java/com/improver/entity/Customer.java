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

    public Customer(String firstName, String lastName, String email, String plainPassword, String internalPhone, String iconUrl) {
        super(firstName, lastName, email, plainPassword, internalPhone, iconUrl);
    }


    public static Customer of(SocialUser socialUser) {
        return new Customer(socialUser.getFirstName(),
            socialUser.getLastName(),
            socialUser.getEmail(),
            null,
            null,
            socialUser.getPicture())
            .setActivated(true);
    }

    @Override
    public Role getRole() {
        return Role.CUSTOMER;
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
    public Customer setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }


}
