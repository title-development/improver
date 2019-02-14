package com.improver.model.socials;

import com.google.api.client.auth.openidconnect.IdToken;
import com.improver.entity.SocialConnection;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

@RequiredArgsConstructor
@Getter
public class SocialUser {
    private final String id;
    private final String email;
    private final String firstName;
    private final String lastName;
    private final String picture;
    private final SocialConnection.Provider provider;

    public SocialUser(FacebookUserProfile userProfile) {
        this.id = userProfile.getId();
        this.email = userProfile.getEmail();
        this.firstName = userProfile.getFirst_name();
        this.lastName = userProfile.getLast_name();
        this.picture = userProfile.getPicture().getData().getUrl();
        this.provider = SocialConnection.Provider.FACEBOOK;
    }

    public SocialUser(IdToken.Payload payload) {
        this.id = payload.getSubject();
        this.email = (String) payload.get("email");
        this.firstName = payload.get("given_name").toString();
        this.lastName = payload.get("family_name").toString();
        this.picture = (String) payload.get("picture");
        this.provider = SocialConnection.Provider.GOOGLE;
    }
}
