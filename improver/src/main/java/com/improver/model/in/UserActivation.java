package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.Pattern;

import static com.improver.util.ErrorMessages.ERR_MSG_PASS_MINIMUM_REQUIREMENTS;
import static com.improver.util.serializer.SerializationUtil.PASS_PATTERN_STRING;

@Data
@Accessors(chain = true)
public class UserActivation {

    private String token;

    @Pattern(regexp = PASS_PATTERN_STRING, message = ERR_MSG_PASS_MINIMUM_REQUIREMENTS)
    private String password;

}
