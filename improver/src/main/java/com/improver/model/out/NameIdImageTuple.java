package com.improver.model.out;

import com.improver.entity.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Read model of {@link ServiceType} to display in "POPULAR HOME SERVICES"
 *
 * @author Mykhailo Soltys
 */
@Getter
@AllArgsConstructor
public class NameIdImageTuple {

    private final long id;
    private final String name;
    private final String image;

}
