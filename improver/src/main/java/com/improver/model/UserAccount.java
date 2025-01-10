package com.improver.model;

import com.improver.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import static com.improver.util.ErrorMessages.NAME_PATTERN_ERROR_MESSAGE;
import static com.improver.util.serializer.SerializationUtil.NAME_PATTERN_STRING;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class UserAccount {

    private long id;
    private String iconUrl;

    @Email
    private String email;

    @Pattern(regexp = NAME_PATTERN_STRING, message = NAME_PATTERN_ERROR_MESSAGE)
    private String firstName;

    @Pattern(regexp = NAME_PATTERN_STRING, message = NAME_PATTERN_ERROR_MESSAGE)
    private String lastName;

    private String displayName;

    private String phone;

    private boolean isNativeUser;


    public UserAccount(User user) {
        this.id = user.getId();
        this.iconUrl = user.getIconUrl();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.displayName = user.getDisplayName();
        this.phone = user.getInternalPhone();
        this.isNativeUser = user.getPassword() != null && !user.getPassword().isEmpty();
    }
}
