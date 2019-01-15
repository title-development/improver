package com.improver.model.in.registration;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import static com.improver.util.serializer.SerializationUtil.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN_STRING;

@Data
@Accessors(chain = true)
public class UserRegistration {

    @Email
    private String email;

    @Pattern(regexp = PASS_PATTERN_STRING, message = ERR_MSG_PASS_MINIMUM_REQUIREMENTS)
    private String password;

    @NotNull
    private String firstName;

    @NotNull
    private String lastName;

    @NotNull
    private String phone;
}
