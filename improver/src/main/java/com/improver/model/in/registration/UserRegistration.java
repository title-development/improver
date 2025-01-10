package com.improver.model.in.registration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import static com.improver.util.ErrorMessages.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.ErrorMessages.NAME_PATTERN_ERROR_MESSAGE;
import static com.improver.util.serializer.SerializationUtil.NAME_PATTERN_STRING;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN_STRING;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class UserRegistration {

    @Email
    private String email;

    @Pattern(regexp = PASS_PATTERN_STRING, message = ERR_MSG_PASS_MINIMUM_REQUIREMENTS)
    private String password;

    @Pattern(regexp = NAME_PATTERN_STRING, message = NAME_PATTERN_ERROR_MESSAGE)
    private String firstName;

    @Pattern(regexp = NAME_PATTERN_STRING, message = NAME_PATTERN_ERROR_MESSAGE)
    private String lastName;

//    @Pattern(regexp = PHONE_PATTERN_STRING, message = PHONE_PATTERN_ERROR_MESSAGE)
    private String phone;

    private String captcha;

    private String referralCode;

    private boolean preventConfirmationEmail;
}
