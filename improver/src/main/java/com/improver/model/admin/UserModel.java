package com.improver.model.admin;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class UserModel {

    protected long id;
    protected User.Role role;
    protected String email;
    protected String displayName;
    protected String firstName;
    protected String lastName;
    protected String iconUrl;
    protected String internalPhone;
    protected Boolean isActivated;
    protected Boolean isBlocked;
    protected Boolean isDeleted;
    protected Boolean isNativeUser;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    protected ZonedDateTime created;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    protected ZonedDateTime updated;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    protected ZonedDateTime lastLogin;


    public UserModel(User user){
        this.id = user.getId();
        this.email = user.getEmail();
        this.displayName = user.getDisplayName();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole();
        this.iconUrl = user.getIconUrl();
        this.internalPhone = user.getInternalPhone();
        this.isActivated = user.isActivated();
        this.isBlocked = user.isBlocked();
        this.isDeleted = user.isDeleted();
        this.isNativeUser = user.isNativeUser();
        this.lastLogin = user.getLastLogin();
        this.updated = user.getUpdated();
        this.created = user.getCreated();
    }


}
