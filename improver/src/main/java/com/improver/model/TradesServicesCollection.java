package com.improver.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotEmpty;
import java.util.List;

@Data
@Accessors(chain = true)
@NoArgsConstructor
@AllArgsConstructor
public class TradesServicesCollection {

    @NotEmpty(message = "At least one Trade should be selected")
    private List<NameIdTuple> trades;

    @NotEmpty(message = "At least one Service Type should be selected")
    private List<OfferedService> services;
}
