package com.improver.model.socials;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SocialUserInfo {
    private String accessToken;
    private String email;
    private String phone;
    private String referralCode;
}
