package com.improver.model.in;

import com.improver.entity.Refund;
import lombok.Data;

@Data
public class RefundRequest {

    private Refund.Issue issue;
    private Refund.Option option;
    private String notes;
    private boolean removeZip;
    private boolean removeService;

}
