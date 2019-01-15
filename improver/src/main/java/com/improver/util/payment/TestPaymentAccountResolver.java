package com.improver.util.payment;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class TestPaymentAccountResolver {

    @Value("${account.stripe.id.c1}")
    private String contractor1Id;

    @Value("${account.stripe.id.c2}")
    private String contractor2Id;

}
