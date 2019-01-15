package com.improver.model;

import com.improver.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.Map;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class UserAccount {

    private long id;
    private String iconUrl;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String phone;
    private boolean isNativeUser;

    public UserAccount(long id, String iconUrl, String email, String firstName, String lastName, String displayName, String phone, String password) {
        this.id = id;
        this.iconUrl = iconUrl;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.displayName = displayName;
        this.phone = phone;
        this.isNativeUser = password != null && !password.isEmpty();
    }

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
