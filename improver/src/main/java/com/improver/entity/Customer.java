package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.model.in.registration.UserRegistration;
import com.improver.model.socials.SocialUser;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.Accessors;

import javax.persistence.*;
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

    @JsonIgnore
    @OneToMany(mappedBy = "customer")
    private List<UserAddress> addresses;

    @Embedded
    private NotificationSettings notificationSettings = new NotificationSettings();

    @Embeddable
    @Data
    public static class NotificationSettings {

        //Messages
        //Email notifications about new chat messages
        private boolean isReceiveMessagesEmail = true;

        //New proposals
        //Email notifications about new project request from PROs
        private boolean isReceiveNewProjectRequestsEmail = true;

        //New proposals
        //Sms notifications about new project request from PROs
        private boolean isReceiveNewProjectRequestsSms = false;

        // Suggestions and tips
        // Receive personalized tips and suggestion to success on market
        private boolean isReceiveSuggestionsEmail = true;
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

    @Override
    public Customer generateValidationKey() {
        super.generateValidationKey();
        return this;
    }
}
