package com.improver.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;


@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
public class NameIdStatusTuple extends NameIdTuple {

    private String status;

    public NameIdStatusTuple(long id, String name, String status) {
        super(id, name);
        this.status = status;
    }
}
