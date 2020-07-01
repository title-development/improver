package com.improver.model.out;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.improver.entity.User;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
public class LoginModel {

    private final long id;
    private final String iconUrl;
    private final String name;
    private final String role;
    private final boolean emailConfirmed;
    private final Long company;
    @JsonIgnore private final String refreshId;
    @JsonIgnore private final String email;

    public LoginModel(long id, String iconUrl, String name, User.Role role, boolean isEmailConfirmed, Long company, String refreshId, String email) {
        this.id = id;
        this.iconUrl = iconUrl;
        this.name = name;
        this.role = role.toString();
        this.emailConfirmed = isEmailConfirmed;
        this.company = company;
        this.refreshId = refreshId;
        this.email = email;
    }
}
