package com.improver.model.out;

import com.improver.model.NameIdTuple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Accessors(chain = true)
public class TradeModel {
    private long id;
    private String name;
    private String image;
    private List<NameIdTuple> services;
}
