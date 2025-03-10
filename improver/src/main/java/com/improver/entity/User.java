package com.improver.entity;

import com.improver.model.in.registration.UserRegistration;
import lombok.Data;
import lombok.experimental.Accessors;
import org.springframework.security.crypto.bcrypt.BCrypt;

import javax.persistence.*;
import java.security.Principal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Entity(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(discriminatorType = DiscriminatorType.STRING, name = "role")
@Data
@Accessors(chain = true)
public class User implements Principal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected long id;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30, updatable = false, insertable = false)
    protected Role role;

    @Column(unique = true)
    protected String email;

    @OneToMany(mappedBy = "user")
    protected List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    protected List<SocialConnection> socialConnections;

    @OneToMany(mappedBy = "user")
    protected List<UserSession> sessions;

    @Column(unique = true)
    protected String newEmail;

    protected String password;

    protected String firstName;

    protected String lastName;

    protected String displayName;

    protected String iconUrl;

    protected String internalPhone;

    protected boolean isActivated = false;

    protected boolean isBlocked = false;

    protected boolean isDeleted = false;

    protected String validationKey;

    protected ZonedDateTime created;

    protected ZonedDateTime updated;

    protected ZonedDateTime lastLogin;

    protected String refreshId;

    //TODO: Remove binding
    @OneToMany(mappedBy = "author")
    protected List<Ticket> createdTickets;

    //TODO: Remove binding
    @OneToMany(mappedBy = "user")
    protected List<UserTutorial> userTutorials;



    protected User() {
    }

    public User generateValidationKey() {
        this.validationKey = UUID.randomUUID().toString();
        return this;
    }

    public User setEmail(String email) {
        this.email = email.toLowerCase();
        return this;
    }

    protected User(UserRegistration reg) {
        this(reg.getFirstName(), reg.getLastName(), reg.getEmail(), reg.getPassword(), reg.getPhone());
        this.updated = this.created = ZonedDateTime.now();
    }

    protected User(String firstName, String lastName, String email, String plainPassword, String internalPhone) {
        this(firstName, lastName, email, plainPassword, internalPhone, null);
    }

    protected User(String firstName, String lastName, String email, String plainPassword, String internalPhone, String iconUrl) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email.toLowerCase();
        this.password = (plainPassword != null) ? BCrypt.hashpw(plainPassword, BCrypt.gensalt()) : null;
        this.displayName = firstName + " " + lastName;
        this.iconUrl = iconUrl;
        this.internalPhone = internalPhone;
        this.isActivated = false;
        this.created = ZonedDateTime.now();
        this.updated = this.created;
        this.isBlocked = false;
    }


    @Deprecated
    @PrePersist
    public void updateDisplayName() {
        if (displayName == null) {
            displayName = firstName + " " + lastName;
        }
    }


    public Role getRole() {
        return role;
    }


    @Override
    public String getName() {
        return email;
    }

    public String getDisplayName() {
        return firstName + " " + lastName;
    }

    public User setPassword(String password) {
        this.password = (password != null) ? BCrypt.hashpw(password, BCrypt.gensalt()) : null;
        return this;
    }

    public boolean isNativeUser() {
        return password != null && !password.isEmpty();
    }

    public User addSocialConnection(SocialConnection socialConnection) {
        if (getSocialConnections() == null) {
            this.socialConnections = new ArrayList<>();
            this.socialConnections.add(socialConnection);
        } else {
            this.socialConnections.add(socialConnection);
        }

        return this;
    }

    /**
     * User role enum
     */
    public enum Role {
        CUSTOMER("CUSTOMER"),
        CONTRACTOR("CONTRACTOR"),
        ADMIN("ADMIN"),
        SUPPORT("SUPPORT"),
        STAKEHOLDER("STAKEHOLDER"),
        MANAGER("MANAGER"),
        INCOMPLETE_PRO("INCOMPLETE_PRO"); //Not fully registered PRO (without company)

        private final String value;

        Role(String role) {
            value = role;
        }

        public boolean equalsValue(String role) {
            return value.equals(role);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }
}
