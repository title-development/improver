package com.improver.model.out;

import com.improver.entity.ServiceType;
import com.improver.entity.Trade;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Read model of {@link ServiceType} or {@link Trade}
 *
 * @author Mykhailo Soltys
 */
@Getter
@AllArgsConstructor
public class NameIdImageTuple {

    private final long id;
    private final String name;
    private final String image;

    public NameIdImageTuple(long id, String name, String image, Long popularity) {
        this.id = id;
        this.name = name;
        this.image = image;
    }
}
