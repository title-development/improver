package com.improver.controller;

import com.improver.application.properties.Path;
import com.improver.model.admin.out.Record;
import com.improver.security.annotation.StaffAccess;
import com.improver.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping(Path.STATISTICS_PATH)
public class StatisticController {

    @Autowired private StatisticsService statisticsService;

    @StaffAccess
    @GetMapping("/users")
    public ResponseEntity<List<Record>> getUsersByRole() {
        List<Record> users = statisticsService.getUserStatistic();

        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    @StaffAccess
    @GetMapping("/users/registration")
    public ResponseEntity<List<Record>> getUsersByRegistration(@RequestParam Record.Period period) {
        List<Record> users = statisticsService.getUsersByRegistrationStatistic(period);

        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/credits")
    public ResponseEntity<List<Record>> getMoneyStatistic(@RequestParam Record.Period period) {
        List<Record> moneyStatistic = statisticsService.getMoneyStatistic(period);

        return new ResponseEntity<>(moneyStatistic, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/finances")
    public ResponseEntity<List<Record>> getFinancesStatistic(@RequestParam Record.Period period) {
        List<Record> moneyStatistic = statisticsService.getMoneyLeftOnBalance(period);

        return new ResponseEntity<>(moneyStatistic, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/tickets")
    public ResponseEntity<List<Record>> getTicketsStatistic(@RequestParam Record.Period period) {
        List<Record> ticketsStatistic = statisticsService.getTicketsStatistic(period);

        return new ResponseEntity<>(ticketsStatistic, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/leads")
    public ResponseEntity<List<Record>> getLeadsStatistic(@RequestParam Record.Period period) {
        List<Record> ticketsStatistic = statisticsService.getLeadsStatistic(period);

        return new ResponseEntity<>(ticketsStatistic, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/top/services")
    public ResponseEntity<List<Record>> getTopServiceTypesStatistic(@RequestParam Record.Period period) {
        List<Record> topServiceTypesStatistic = statisticsService.getTopServiceTypesStatistic(period);

        return new ResponseEntity<>(topServiceTypesStatistic, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/top/services/project-sold")
    public ResponseEntity<List<Record>> getTopServiceTypesByProjectSoldStatistic(@RequestParam Record.Period period) {
        List<Record> services = statisticsService.getTopServiceTypeByProjectSold(period);

        return new ResponseEntity<>(services, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/top/contractors/rating")
    public ResponseEntity<List<Record>> getTopRatedContractorsStatistics(@RequestParam Record.Period period) {
        List<Record> companies = statisticsService.getTopRatedContractorsStatistics(period);

        return new ResponseEntity<>(companies, HttpStatus.OK);
    }

    @StaffAccess
    @GetMapping("/top/contractors/profit")
    public ResponseEntity<List<Record>> getProfitableContractorStatistics(@RequestParam Record.Period period) {
        List<Record> companies = statisticsService.getProfitableContractorStatistics(period);

        return new ResponseEntity<>(companies, HttpStatus.OK);
    }


}
