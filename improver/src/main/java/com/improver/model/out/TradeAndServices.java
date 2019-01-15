package com.improver.model.out;

import com.improver.model.NameIdTuple;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TradeAndServices {

    private long id;
    private String name;
    private List<NameIdTuple> services;


    public TradeAndServices(long id, String name) {
        this.id = id;
        this.name = name;
    }
}
