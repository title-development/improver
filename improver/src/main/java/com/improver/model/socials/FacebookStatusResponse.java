package com.improver.model.socials;

import lombok.Data;

@Data
public class FacebookStatusResponse {
    private String status;
    private FacebookAuthResponse authResponse;
}

