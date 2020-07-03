package com.improver.model.out;

import com.improver.model.NameIdTuple;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain = true)
public class TradeModel {

    private long id;
    private String name;
    private String image;
    private List<NameIdTuple> services;

}
