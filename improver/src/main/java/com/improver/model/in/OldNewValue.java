package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class OldNewValue {

    private String oldValue;
    private String newValue;
}
