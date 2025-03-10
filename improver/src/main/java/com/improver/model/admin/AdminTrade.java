package com.improver.model.admin;

import com.improver.entity.Trade;
import com.improver.model.NameIdTuple;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import java.util.ArrayList;
import java.util.List;

@Data
@Accessors(chain = true)
@NoArgsConstructor
public class AdminTrade {
    private long id;
    private String name;
    private String description;
    private List<String> imageUrls;
    private Boolean isAdvertised;
    private List<NameIdTuple> services = new ArrayList<>();

    public AdminTrade(Trade trade, List<NameIdTuple> services) {
        this.id = trade.getId();
        this.name = trade.getName();
        this.description = trade.getDescription();
        this.imageUrls = trade.getImageUrlsFromString();
        this.isAdvertised = trade.isAdvertised();
        this.services = services;
    }

    // Fix Pageable and count issue
    public AdminTrade(Trade trade, int dummy) {
        this.id = trade.getId();
        this.name = trade.getName();
        this.description = trade.getDescription();
        this.imageUrls = trade.getImageUrlsFromString();
        this.isAdvertised = trade.isAdvertised();
    }
}
