package com.improver.model.socials;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Pattern;

import static com.improver.util.ErrorMessages.PHONE_PATTERN_ERROR_MESSAGE;
import static com.improver.util.serializer.SerializationUtil.PHONE_PATTERN_STRING;

@Data
@NoArgsConstructor
public class PhoneSocialCredentials {
    private String accessToken;

    @Pattern(regexp = PHONE_PATTERN_STRING, message = PHONE_PATTERN_ERROR_MESSAGE)
    private String phone;
}
