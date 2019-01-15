package com.improver.model.out;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

@Data
@Getter
@AllArgsConstructor
public class MessengerDocument {
    private String name;
    private String url;
}
