package com.improver.model.socials;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class SocialUser {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String picture;
}
