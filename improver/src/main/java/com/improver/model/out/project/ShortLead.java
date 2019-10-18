package com.improver.model.out.project;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.improver.entity.Centroid;
import com.improver.entity.Location;
import com.improver.entity.Project;
import lombok.Getter;

import java.time.ZonedDateTime;

import static com.improver.util.serializer.SerializationUtil.DATE_TIME_PATTERN;


@Getter
public class ShortLead {

    private final long id;
    private final String serviceType;
    private final Location location;
    @JsonFormat(pattern = DATE_TIME_PATTERN)
    private final ZonedDateTime created;
    private final int price;
    private Centroid centroid;


    public ShortLead(long id, String serviceType, Location location, ZonedDateTime created, int price, Centroid centroid) {
        this.id = id;
        this.serviceType = serviceType;
        this.location = location.setStreetAddress("");
        this.created = created;
        this.price = price;
        this.centroid = centroid;
    }

    public ShortLead(Project project) {
        this.id = project.getId();
        this.serviceType = project.getServiceType().getName();
        this.location = project.getLocation().setStreetAddress(null);
        this.created = project.getCreated();
        this.price = project.getLeadPrice();
        this.centroid = project.getCentroid();
    }
}
