package com.improver.model.out;

import com.improver.entity.Refund;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.ZonedDateTime;

@Getter
@RequiredArgsConstructor
public class RefundResult {
    private final String comment;
    private final Refund.Status status;
    private final ZonedDateTime created;
}
