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
    private boolean quickReply;

    @JsonIgnore
    @Column(columnDefinition = "varchar(500)")
    private String replyText;

    public Contractor(UserRegistration reg) {
        super(reg);
    }

    public Contractor(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        super(firstName, lastName, email, plainPassword, internalPhone);
    }

    public Contractor(String firstName, String lastName, String email, String plainPassword, String internalPhone, String iconUrl) {
        super(firstName, lastName, email, plainPassword, internalPhone, iconUrl);
    }

    public static Contractor of(SocialUser socialUser, String internalPhone) {
        return new Contractor()
            .setEmail(socialUser.getEmail())
            .setFirstName(socialUser.getFirstName())
            .setLastName(socialUser.getLastName())
            .setActivated(true)
            .setCreated(ZonedDateTime.now())
            .setInternalPhone(internalPhone)
            .setIconUrl(socialUser.getPicture());
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
    public Contractor setId(long id) {
        super.setId(id);
        return this;
    }

    @Override
    public Contractor setEmail(String email) {
        super.setEmail(email);
        return this;
    }

    @Override
    public Contractor setPassword(String password) {
        super.setPassword(password);
        return this;
    }

    @Override
    public Contractor setFirstName(String firstName) {
        super.setFirstName(firstName);
        return this;
    }

    @Override
    public Contractor setLastName(String lastName) {
        super.setLastName(lastName);
        return this;
    }

    @Override
    public Contractor setDisplayName(String displayName) {
        super.setDisplayName(displayName);
        return this;
    }

    @Override
    public Contractor setActivated(boolean isActive) {
        super.setActivated(isActive);
        return this;
    }

    @Override
    public Contractor setBlocked(boolean isEnabled) {
        super.setBlocked(isEnabled);
        return this;
    }

    @Override
    public Contractor setCreated(ZonedDateTime created) {
        super.setCreated(created);
        return this;
    }

    @Override
    public Contractor setLastLogin(ZonedDateTime lastLogin) {
        super.setLastLogin(lastLogin);
        return this;
    }

    @Override
    public Contractor setIconUrl(String iconUrl) {
        super.setIconUrl(iconUrl);
        return this;
    }

    public Contractor setInternalPhone(String internalPhone) {
        super.setInternalPhone(internalPhone);
        return this;
    }
}
