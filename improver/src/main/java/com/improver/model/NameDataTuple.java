package com.improver.model;

import com.improver.entity.Image;
import lombok.Data;
import lombok.experimental.Accessors;


@Data
@Accessors(chain = true)
public class NameDataTuple {

    private String name;
    private byte[] data;

    public NameDataTuple(Image image) {
        this.name = image.getName();
        this.data = image.getData();
    }
}
