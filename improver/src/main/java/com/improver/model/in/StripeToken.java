package com.improver.model.in;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class StripeToken {

    private String id;
//    @JsonProperty("client_ip")
    private String clientIp;
    private Long created;

}
