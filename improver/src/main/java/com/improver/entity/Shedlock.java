package com.improver.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import jakarta.persistence.*;
import java.time.ZonedDateTime;


@Data
@Accessors(chain = true)
@Entity(name = "shedlock")
public class Shedlock {

    @Id
    private String name;
    private ZonedDateTime lockUntil;
    private ZonedDateTime lockedAt;
    private String lockedBy;
}
