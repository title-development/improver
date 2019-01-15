package com.improver.model.in.registration;

import com.improver.entity.User;
import lombok.Data;

@Data
public class StaffRegistration extends UserRegistration {
    private User.Role role;
}
