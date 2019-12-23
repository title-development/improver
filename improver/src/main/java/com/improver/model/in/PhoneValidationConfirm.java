package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class PhoneValidationConfirm {
    private String messageSid;
    private String code;
}
