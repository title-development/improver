package com.improver.model.out;

import lombok.Getter;
import lombok.RequiredArgsConstructor;


import java.util.LinkedList;

@Getter
@RequiredArgsConstructor
public class CompanyLeadsReport {

    private final DetailedMonthReport current;
    private final LinkedList<MonthReport> past;


    @Getter
    @RequiredArgsConstructor
    public static class MonthReport {
        private final String month;
        private final int deals;
        private final int spend;
    }

    @Getter
    @RequiredArgsConstructor
    public static class DetailedMonthReport {
        private final String month;
        private final int payAndGoDeals;
        private final int payAndGoSpend;
        private final int subscriptionDeals;
        private final int subscriptionSpend;
        private final int subscriptionAmount;
    }

}
