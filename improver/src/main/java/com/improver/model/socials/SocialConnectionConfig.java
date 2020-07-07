package com.improver.model.socials;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SocialConnectionConfig {
    private String accessToken;
    private String email;
    private String phone;
    private String referralCode;
    private boolean preventConfirmationEmail;
}
