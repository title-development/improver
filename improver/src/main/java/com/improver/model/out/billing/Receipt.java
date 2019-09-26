package com.improver.model.out.billing;


import com.improver.entity.Location;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Accessors(chain = true)
public class Receipt {

    public static final String PURCHASE_RECORD_TYPE = "Purchase";
    public static final String RETURN_RECORD_TYPE = "Refund";
    public static final String PURCHASE_DESC = "Lead price";
    public static final String REFUND_DESC = "Credit returned to balance";


    private String id;
    private Record detail;

    // ===== general
    private boolean isInvoice;
    private String comments;
    private int totalSpend;

    // ======== project details
    private Long projectRequestId;
    private String customer;
    private Location location;
    private String service;

    //======= payment
    private String paymentMethod;
    private String code;

    //====== records
    private List<Record> records = new ArrayList<>();


    @Data
    @AllArgsConstructor
    public static class Record {
        private ZonedDateTime date;
        private String type;
        private String description;
        private int price;
    }

}
