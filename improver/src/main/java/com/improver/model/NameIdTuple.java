package com.improver.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Accessors(chain = true)
public class NameIdTuple {

    protected long id;
    protected String name;

    public NameIdTuple(long id, String name, Long popularity) {
        this.id = id;
        this.name = name;
    }
}
