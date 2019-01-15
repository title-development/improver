package com.improver.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import lombok.experimental.Accessors;


@Data
@Accessors(chain = true)
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
public class NameIdParentTuple extends NameIdTuple {

    private long parentId;


    public NameIdParentTuple(long id, String name, long parentId) {
        super(id, name);
        this.parentId = parentId;
    }
}
