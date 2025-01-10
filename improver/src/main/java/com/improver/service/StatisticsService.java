package com.improver.service;

import com.improver.model.admin.out.Record;
import com.improver.repository.CompanyRepository;
import com.improver.repository.ServiceTypeRepository;
import com.improver.repository.UserRepository;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.*;

@Service
public class StatisticsService {

    private static final int MONTH_IN_HALF_YEAR = 6;
    private static final int DAYS_IN_MONTH = 30;
    private static final int DAYS_IN_WEEK = 7;

    @Autowired private EntityManager em;
    @Autowired private UserRepository userRepository;
    @Autowired private ServiceTypeRepository serviceTypeRepository;
    @Autowired private CompanyRepository companyRepository;

    public List<Record> getUserStatistic() {

        return userRepository.getUsersInSystem();
    }

    public List<Record> getUsersByRegistrationStatistic(Record.Period period) {
        Period period1 = new Period(period);
        int interval = period1.getInterval();
        String periodName = period1.getPeriodName();

        String contractorQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(u.id) FROM users AS u " +
                "        WHERE date_trunc(?1, u.created) = date_trunc(?1, tu.time_unit) " +
                "          AND u.role = 'CONTRACTOR' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'CONTRACTOR' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        contractorQuery = String.format(contractorQuery, interval + " " + periodName, "1 " + periodName);

        String customerQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(u.id) FROM users AS u " +
                "        WHERE date_trunc(?1, u.created) = date_trunc(?1, tu.time_unit) " +
                "          AND u.role = 'CUSTOMER' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'CUSTOMER' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        customerQuery = String.format(customerQuery, interval + " " + periodName, "1 " + periodName);

        Query contractorsQ = this.em.createNativeQuery(contractorQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query customersQ = this.em.createNativeQuery(customerQuery, "StatisticDate")
            .setParameter(1, periodName);
        List<Record> contractors = contractorsQ.getResultList();
        List<Record> customers = customersQ.getResultList();
        contractors.addAll(customers);

        return contractors;
    }

    public List<Record> getMoneyStatistic(Record.Period period) {
        Period period1 = new Period(period);
        int interval = period1.getInterval();
        String periodName = period1.getPeriodName();

        String purchaseQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT SUM(t.amount) FROM transactions AS t " +
                "        WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "          AND t.type = 'PURCHASE' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'PURCHASE' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        purchaseQuery = String.format(purchaseQuery, interval + " " + periodName, "1 " + periodName);

        String refundQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT SUM(t.amount) FROM transactions AS t " +
                "        WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "          AND t.type = 'RETURN' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'REFUNDED' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        refundQuery = String.format(refundQuery, interval + " " + periodName, "1 " + periodName);

        Query purchaseQ = this.em.createNativeQuery(purchaseQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query refundQ = this.em.createNativeQuery(refundQuery, "StatisticDate")
            .setParameter(1, periodName);
        List<Record> purchaseStatistic = purchaseQ.getResultList();
        List<Record> refundStatistic = refundQ.getResultList();
        purchaseStatistic.addAll(refundStatistic);

        return purchaseStatistic;
    }

    public List<Record> getTicketsStatistic(Record.Period period) {
        Period period1 = new Period(period);
        int interval = period1.getInterval();
        String periodName = period1.getPeriodName();

        String newTicketQueryString =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(t.id) FROM tickets AS t " +
                "        WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "          AND t.status = 'NEW' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'NEW' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        newTicketQueryString = String.format(newTicketQueryString, interval + " " + periodName, "1 " + periodName);

        String closedTicketQueryString =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(t.id) FROM tickets AS t " +
                "        WHERE date_trunc(?1, t.updated) = date_trunc(?1, tu.time_unit) " +
                "          AND t.status = 'CLOSED' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'CLOSED' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        closedTicketQueryString = String.format(closedTicketQueryString, interval + " " + periodName, "1 " + periodName);

        Query newTicketsQuery = this.em.createNativeQuery(newTicketQueryString, "StatisticDate")
            .setParameter(1, periodName);
        Query closedTicketsQuery = this.em.createNativeQuery(closedTicketQueryString, "StatisticDate")
            .setParameter(1, periodName);

        List<Record> newTicketStatistic = newTicketsQuery.getResultList();
        List<Record> closedTicketStatistic = closedTicketsQuery.getResultList();
        newTicketStatistic.addAll(closedTicketStatistic);

        return newTicketStatistic;
    }

    public List<Record> getLeadsStatistic(Record.Period period) {
        Period period1 = new Period(period);
        int interval = period1.getInterval();
        String periodName = period1.getPeriodName();

        String receivedLeadsQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(p.id) FROM projects AS p " +
                "        WHERE date_trunc(?1, p.created) = date_trunc(?1, tu.time_unit) " +
                "          AND p.status != 'INVALID') AS amount, date_trunc(?1, tu.time_unit) AS date, 'RECEIVED' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        receivedLeadsQuery = String.format(receivedLeadsQuery, interval + " " + periodName, "1 " + periodName);

        String soldLeadsQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(p.id) FROM project_requests AS p " +
                "        WHERE date_trunc(?1, p.created) = date_trunc(?1, tu.time_unit) ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'SOLD' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        soldLeadsQuery = String.format(soldLeadsQuery, interval + " " + periodName, "1 " + periodName);

        String refundLeadsQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT COUNT(t.id) FROM transactions AS t " +
                "        WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "          AND t.type = 'RETURN') AS amount, date_trunc(?1, tu.time_unit) AS date, 'REFUNDED' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        refundLeadsQuery = String.format(refundLeadsQuery, interval + " " + periodName, "1 " + periodName);

        Query receivedLeadsQ = this.em.createNativeQuery(receivedLeadsQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query soldLeadsQ = this.em.createNativeQuery(soldLeadsQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query refundLeadsQ = this.em.createNativeQuery(refundLeadsQuery, "StatisticDate")
            .setParameter(1, periodName);

        List<Record> receivedLeadsStatistic = receivedLeadsQ.getResultList();
        List<Record> soldLeadsStatistic = soldLeadsQ.getResultList();
        List<Record> refundedStatistic = refundLeadsQ.getResultList();

        receivedLeadsStatistic.addAll(soldLeadsStatistic);
        receivedLeadsStatistic.addAll(refundedStatistic);

        return receivedLeadsStatistic;
    }

    public List<Record> getMoneyLeftOnBalance(Record.Period period) {
        Period period1 = new Period(period);
        int interval = period1.getInterval();
        String periodName = period1.getPeriodName();

        String purchaseQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT SUM(t.amount) FROM transactions AS t " +
                "        WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "          AND t.type = 'PURCHASE' ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'PURCHASE' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit ORDER BY tu.time_unit";
        purchaseQuery = String.format(purchaseQuery, interval + " " + periodName, "1 " + periodName);

        String moneyLeftOnBalanceQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit)," +
                " companies AS (SELECT DISTINCT p.company_id as id FROM transactions AS p) " +
                "SELECT (SELECT SUM(c.balance) " +
                "        FROM (SELECT (SELECT p.balance " +
                "                      FROM transactions AS p " +
                "                      WHERE date_trunc(?1, p.created) <= date_trunc(?1, tu.time_unit) " +
                "                        AND p.company_id = company.id " +
                "                      ORDER BY p.created DESC " +
                "                      LIMIT 1) AS balance " +
                "              FROM companies company) c)     AS amount, " +
                "              date_trunc(?1, tu.time_unit)   AS date, " +
                "              'BALANCE'                      AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit " +
                "ORDER BY tu.time_unit";
        moneyLeftOnBalanceQuery = String.format(moneyLeftOnBalanceQuery, interval + " " + periodName, "1 " + periodName);

        String incomeQuery =
            "WITH time_units AS (SELECT time_unit FROM generate_series(CURRENT_DATE - INTERVAL '%s', CURRENT_DATE, INTERVAL '%s') time_unit) " +
                "SELECT (SELECT SUM(t.amount) FROM transactions AS t " +
                "           WHERE date_trunc(?1, t.created) = date_trunc(?1, tu.time_unit) " +
                "              AND t.charge_id NOTNULL " +
                "       ) AS amount, date_trunc(?1, tu.time_unit) AS date, 'INCOME' AS type " +
                "FROM time_units tu " +
                "GROUP BY tu.time_unit " +
                "ORDER BY tu.time_unit";
        incomeQuery = String.format(incomeQuery, interval + " " + periodName, "1 " + periodName);

        Query purchaseQ = this.em.createNativeQuery(purchaseQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query moneyLeftOnBalanceQ = this.em.createNativeQuery(moneyLeftOnBalanceQuery, "StatisticDate")
            .setParameter(1, periodName);
        Query incomeQ = this.em.createNativeQuery(incomeQuery, "StatisticDate")
            .setParameter(1, periodName);

        List<Record> moneyLeftOfBalanceStatistic = moneyLeftOnBalanceQ.getResultList();
        List<Record> purchaseStatistic = purchaseQ.getResultList();
        List<Record> incomeStatistic = incomeQ.getResultList();
        incomeStatistic.addAll(purchaseStatistic);
        incomeStatistic.addAll(moneyLeftOfBalanceStatistic);

        return incomeStatistic;
    }


    public List<Record> getTopServiceTypesStatistic(Record.Period period) {
        Period period1 = new Period(period);
        return serviceTypeRepository.getTopServiceTypes(period1.getStartDate(), PageRequest.of(0, 10));
    }

    public List<Record> getTopServiceTypeByProjectSold(Record.Period period) {
        Period period1 = new Period(period);

        return serviceTypeRepository.getTopServiceTypeByProjectSold(period1.getStartDate(), PageRequest.of(0, 10));
    }

    public List<Record> getTopRatedContractorsStatistics(Record.Period period) {
        Period period1 = new Period(period);

        return companyRepository.getTopRatedCompanies(period1.getStartDate(), PageRequest.of(0, 10));
    }

    public List<Record> getProfitableContractorStatistics(Record.Period period) {
        Period period1 = new Period(period);

        return companyRepository.getProfitableCompanies(period1.getStartDate(), PageRequest.of(0, 10));
    }

    @Getter
    private class Period {
        private int interval;
        private String periodName;
        private ZonedDateTime startDate;

        public Period(Record.Period period) {
            switch (period) {
                case MONTH:
                    interval = DAYS_IN_MONTH;
                    periodName = "day";
                    startDate = ZonedDateTime.now().minusDays(DAYS_IN_MONTH);
                    break;
                case WEEK:
                    interval = DAYS_IN_WEEK;
                    periodName = "day";
                    startDate = ZonedDateTime.now().minusDays(DAYS_IN_WEEK);
                    break;
                default:
                    interval = MONTH_IN_HALF_YEAR;
                    periodName = "month";
                    startDate = ZonedDateTime.now().minusMonths(MONTH_IN_HALF_YEAR);
                    break;
            }
            // Offset 1 period to get correct data in sql
            interval--;
        }
    }
}
