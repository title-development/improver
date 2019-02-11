package com.improver.model.socials;

import com.google.api.client.auth.openidconnect.IdToken;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class SocialUser {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String picture;

    public static SocialUser of(FacebookUserProfile userProfile) {
        return new SocialUser()
            .setEmail(userProfile.getEmail())
            .setId(userProfile.getId())
            .setFirstName(userProfile.getFirst_name())
            .setLastName(userProfile.getLast_name())
            .setPicture(userProfile.getPicture().getData().getUrl());
    }

    public static SocialUser of(IdToken.Payload payload) {
        return new SocialUser()
            .setId(payload.getSubject())
            .setEmail((String) payload.get("email"))
            .setFirstName(payload.get("given_name").toString())
            .setLastName(payload.get("family_name").toString())
            .setPicture((String) payload.get("picture"));
    }
}
