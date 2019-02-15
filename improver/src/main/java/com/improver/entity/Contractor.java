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
    private boolean isIncomplete;

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
        return new Contractor(socialUser.getFirstName(),
            socialUser.getLastName(),
            socialUser.getEmail(),
            null,
            internalPhone,
            socialUser.getPicture())
            .setIncomplete(true)
            .setActivated(true);
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

}
