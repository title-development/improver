package com.improver.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.model.socials.SocialUser;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.persistence.*;
import java.time.ZonedDateTime;

@Entity(name = "social_connection")
@Data
@Accessors(chain = true)
@NoArgsConstructor
public class SocialConnection {

    @Id
    @JsonIgnore
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    private String providerId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name="user_id",  foreignKey = @ForeignKey(name = "social_connection_user_fkey"))
    private User user;

    @Enumerated(EnumType.STRING)
    private Provider provider;

    @JsonIgnore
    private ZonedDateTime created = ZonedDateTime.now();

    public SocialConnection (SocialUser socialUser, User user) {
        this.providerId = socialUser.getId();
        this.provider = socialUser.getProvider();
        this.user = user;
        this.created = ZonedDateTime.now();
    }

    public enum Provider {
        FACEBOOK ("FACEBOOK"),
        GOOGLE ("GOOGLE");

        private final String value;

        Provider(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        @Override
        public String toString() {
            return this.value;
        }
    }
}
