package com.improver.model.out;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentCard {

    private String id;
    private String brand;
    private String last4;
    private Integer expMonth;
    private Integer expYear;

}
