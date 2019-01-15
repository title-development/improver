package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class EmailPasswordTuple {
    String email;
    String password;
}
