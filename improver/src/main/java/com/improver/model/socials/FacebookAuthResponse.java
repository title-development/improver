package com.improver.model.socials;

import lombok.Data;

@Data
public class FacebookAuthResponse {
    private String accessToken;
    private int expiresIn;
    private String signedRequest;
    private String userID;
    private int reauthorize_required_in;
}
