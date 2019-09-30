package com.improver.model.out;

import com.improver.entity.User;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@NoArgsConstructor
@Accessors(chain = true)
public class UserModel {

    private long id;
    private String name;
    private String iconUrl;
    private String email;
    private String phone;


    public UserModel(long id, String name, String iconUrl) {
        this.id = id;
        this.name = name;
        this.iconUrl = iconUrl;
    }

    public UserModel(long id, String name, String iconUrl, String email, String phone) {
        this.id = id;
        this.name = name;
        this.iconUrl = (iconUrl == null) ? "" : iconUrl;
        this.email = email;
        this.phone = phone;
    }

    public static UserModel of(User user){
        return new UserModel().setId(user.getId())
            .setName(user.getDisplayName())
            .setEmail(user.getEmail())
            .setIconUrl(user.getIconUrl())
            .setPhone(user.getInternalPhone());
    }

}
