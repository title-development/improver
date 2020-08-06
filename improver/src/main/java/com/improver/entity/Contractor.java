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
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;


@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@DiscriminatorValue("CONTRACTOR")
@Entity(name = "contractors")
@NoArgsConstructor
@ToString(exclude = {"company", "projectRequests"})
public class Contractor extends User {

    @ManyToOne
    @JoinColumn(name="company_id",  foreignKey = @ForeignKey(name = "contractor_company_fkey"))
    @JsonIgnore
    private Company company;

    @OneToMany(mappedBy = "contractor", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<ProjectRequest> projectRequests;

    @JsonIgnore
    private boolean isIncomplete;

    @JsonIgnore
    @Column(unique = true)
    private String refCode;

    @JsonIgnore
    private String referredBy;

    @JsonIgnore
    private boolean referralBonusReceived;

    // TODO move to Notification settings
    @JsonIgnore
    private boolean quickReply;

    @JsonIgnore
    @Column(columnDefinition = "varchar(500)")
    private String replyText;

    @Embedded
    private NotificationSettings notificationSettings = new NotificationSettings();

    @Data @Accessors(chain = true)
    @Embeddable
    public static class NotificationSettings {

        // New Leads
        // Email notifications of new leads available for purchase
        private boolean isReceiveNewLeadsEmail = true;

        // New Leads
        // SMS notifications of new leads available for purchase
        private boolean isReceiveNewLeadsSms = false;

        // New Subscription Leads
        // Email notifications of new subscription leads
        private boolean isReceiveNewSubscriptionLeadsEmail = true;

        // New Subscription Leads
        // SMS notifications of new subscription leads
        private boolean isReceiveNewSubscriptionLeadsSms = true;

        // New messages
        // Email notifications about new chat messages
        private boolean isReceiveMessagesEmail = true;

        // Suggestions and tips
        // Receive personalized tips and suggestion to success on market
        private boolean isReceiveSuggestionsEmail = true;

    }

    public Contractor(UserRegistration reg) {
        super(reg);
        this.setRefCode(generateRefCode());
    }

    public Contractor(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
        this.setRefCode(generateRefCode());

    }

    public Contractor(String firstName, String lastName, String email, String plainPassword, String internalPhone, String iconUrl) {
        super(firstName, lastName, email, plainPassword, internalPhone, iconUrl);
        this.setRefCode(generateRefCode());
    }

    public static Contractor of(SocialUser socialUser, String internalPhone, String referredBy) {

        return new Contractor(socialUser.getFirstName(),
            socialUser.getLastName(),
            socialUser.getEmail(),
            null,
            internalPhone,
            socialUser.getPicture())
            .setReferredBy(referredBy)
            .setActivated(true)
            .setIncomplete(true);
    }

    private static String generateRefCode() {
        return UUID.randomUUID().toString().substring(0,16);
    }

    @Override
    public Role getRole() {
        return Role.CONTRACTOR;
    }


    @Override
    public Contractor setValidationKey(String validationKey) {
        super.setValidationKey(validationKey);
        return this;
    }

    @Override
    public Contractor setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }


    @Override
    public Contractor setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Contractor generateValidationKey() {
        super.generateValidationKey();
        return this;
    }

}
