package com.improver.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@AllArgsConstructor
public class OfferedService {

    private long id;
    private String name;
    private Boolean enabled;
    private int leadPrice;
    private long tradeId;

    public OfferedService(long id, String name, int leadPrice) {
        this.id = id;
        this.name = name;
        this.leadPrice = leadPrice;
    }

    public OfferedService(long id, String name, int leadPrice, long tradeId) {
        this.id = id;
        this.name = name;
        this.leadPrice = leadPrice;
        this.tradeId = tradeId;
    }
}
