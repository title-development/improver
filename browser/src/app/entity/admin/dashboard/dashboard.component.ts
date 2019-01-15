import { Component, OnInit, ViewChild } from '@angular/core';
import { StatisticService } from '../../../api/services/statistic.service';
import { capitalize } from '../../../util/functions';
import { format } from 'date-fns';
import { enumToArrayList } from '../../../util/tricks.service';
import { Statistic } from '../../../api/models/Statistic';
import { SelectItem } from 'primeng/api';
import { UIChart } from 'primeng/chart';
import { SecurityService } from '../../../auth/security.service';
import { Role } from '../../../model/security-model';

enum Colors {
  DARKCYAN = 'grey',
  DARKORANGE = 'darkorange',
  GREEN = 'green',
  YELLOW = 'yellow',
  CYAN = 'cyan',
  RED = 'red',
  BLUE = 'blue',
  KHAKI = 'khaki',
  ORANGE = 'brown',
  FUCHSIA = 'fuchsia'
}

enum StatisticColors {
  CONTRACTOR = 'darkcyan',
  CUSTOMER = 'darkorange',
  REFUND = 'red',
  REPLENISHMENT = 'cyan',
  IN_PROGRESS = 'red',
  NEW = 'blue',
  CLOSED = 'green',
  SOLD = 'green',
  RECEIVED = 'blue',
  REFUNDED = 'red',
  PURCHASE = 'darkcyan',
  RATING = 'darkcyan',
  PROFIT = 'darkorange',
  INCOME = 'green',
  BALANCE = 'darkorange',

}

@Component({
  selector: 'admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  leadsPeriod = Statistic.Period.HALF_YEAR;
  ticketsPeriod = Statistic.Period.HALF_YEAR;
  moneyPeriod = Statistic.Period.HALF_YEAR;
  userRegistrationPeriod = Statistic.Period.HALF_YEAR;
  topServicePeriod = Statistic.Period.HALF_YEAR;
  topServiceByProjectSoldPeriod = Statistic.Period.HALF_YEAR;
  topRatedContractorsPeriod = Statistic.Period.HALF_YEAR;
  topProfitableContractorsPeriod = Statistic.Period.HALF_YEAR;
  financesPeriod = Statistic.Period.HALF_YEAR;
  statisticPeriods: Array<SelectItem> = [
    {label: 'Half year', value: 'HALF_YEAR'},
    {label: 'Month', value: 'MONTH'},
    {label: 'Week', value: 'WEEK'},
  ];

  @ViewChild('topSoldServiceChart') topSoldServiceChart: UIChart;
  @ViewChild('topServiceChart') topServiceChart: UIChart;
  moneyChartOptions;
  topCompanyChartOptions;
  chartBarOptions;
  ticketsOptions;
  Role = Role;

  money = {labels: [], datasets: []};
  finances = {labels: [], datasets: []};
  usersRegistration = {labels: [], datasets: []};
  leads = {labels: [], datasets: []};
  tickets = {labels: [], datasets: []};
  users = {labels: [], datasets: []};
  popularServices = {labels: [], datasets: []};
  popularServicesByProjectSold = {labels: [], datasets: []};
  topProfitableContractors = {labels: [], datasets: []};
  topRatedContractors = {labels: [], datasets: []};

  constructor(private statisticService: StatisticService, public securityService: SecurityService) {
  }

  selectData(event) {
    // this.msgs = [];
    // this.msgs.push({severity: 'info', summary: 'Data Selected', 'detail': this.data.datasets[event.element._datasetIndex].data[event.element._index]});

  }

  ngOnInit() {
    this.getUserStatistics();
    this.getTicketsStatistic();
    this.getLeadsStatistics();
    this.getUserRegistrationStatistic();
    this.getMoneyStatistic();
    this.getFinancesStatistic();
    this.getTopServicesStatistic();
    this.getTopServicesByProjectSoldStatistic();
    this.getContractorsRatingStatistics();
    this.getContractorsProfitStatistics();
  }

  getUserStatistics(): void {
    this.statisticService.usersInSystem().subscribe((users: Array<Statistic>) => {
      this.users.labels = users.map(user => capitalize(user.name));
      this.users.datasets = [{
        data: users.map(user => user.amount),
        backgroundColor: enumToArrayList(StatisticColors)
      }];
    }, err => {
      console.log(err);
    });
  }

  getUserRegistrationStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.usersRegistration(period).subscribe((statistic: Array<Statistic>) => {
      this.usersRegistration = this.generateData(statistic, period);
    });
  }

  getTicketsStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.ticketsStatistic(period).subscribe((statistic: Array<Statistic>) => {
      this.tickets = this.generateData(statistic, period);
      this.ticketsOptions = {
        scales: {
          yAxes: [{
            ticks: {
              stepSize: 1
            }
          }]
        }
      };
    });
  }

  getMoneyStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.moneyStatistic(period).subscribe((statistic: Array<Statistic>) => {
      this.money = this.generateData(statistic, period, (price) => {
        return price / 100;
      });
      this.moneyChartOptions = {
        scales: {
          yAxes: [{
            ticks: {
              callback: function (value, index, values) {
                return '$' + value;
              }
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return '$' + tooltipItem.yLabel;
            }
          }
        }
      };
    });
  }

  getFinancesStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.financesStatistic(period).subscribe((statistic: Array<Statistic>) => {
      this.finances = this.generateData(statistic, period, (price) => {
        return price / 100;
      });
      this.moneyChartOptions = {
        scales: {
          yAxes: [{
            ticks: {
              callback: function (value, index, values) {
                return '$' + value;
              }
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              return '$' + tooltipItem.yLabel;
            }
          }
        }
      };
    });
  }

  getLeadsStatistics(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.leadsStatistics(period).subscribe((statistic: Array<Statistic>) => {
      this.leads = this.generateData(statistic, period);
    });
  }

  getTopServicesStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.topServices(period).subscribe((statistic: Array<Statistic>) => {
      this.popularServices.labels = statistic.map(item => capitalize(item.name));
      this.popularServices.datasets = [{
        data: statistic.map(item => item.amount),
        backgroundColor: enumToArrayList(Colors)
      }];
      if (this.topServiceChart) {
        this.topServiceChart.reinit();
      }
    });

  }

  getTopServicesByProjectSoldStatistic(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.topServicesByProjectSold(period).subscribe((statistic: Array<Statistic>) => {
      this.popularServicesByProjectSold.labels = statistic.map(item => capitalize(item.name));
      this.popularServicesByProjectSold.datasets = [{
        data: statistic.map(item => item.amount),
        backgroundColor: enumToArrayList(Colors)
      }];
      if (this.topSoldServiceChart) {
        this.topSoldServiceChart.reinit();
      }
    });
  }

  getContractorsProfitStatistics(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.contractorProfitStatistic(period).subscribe((statistic: Array<Statistic>) => {
      this.topProfitableContractors = this.generateData(statistic, period, price => price / 100);
    });
    this.topCompanyChartOptions = {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true,
            callback: function (value, index, values) {
              return '$' + value;
            }
          }
        }],
        xAxes: [{
          ticks: {
            callback: function (value, index, values) {
              return value.substring(0, 8) + '...';
            }
          }
        }]
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            return '$' + tooltipItem.yLabel;
          },
          title: function (tooltipItem, data) {
            return data.labels[tooltipItem[0].index];
          }
        }
      }
    };
  }

  getContractorsRatingStatistics(period: Statistic.Period = Statistic.Period.HALF_YEAR): void {
    this.statisticService.contractorRatingStatistic(period).subscribe((statistic: Array<Statistic>) => {
      this.topRatedContractors = this.generateData(statistic, period);
    });
    this.chartBarOptions = {
      scales: {
        xAxes: [{
          ticks: {
            callback: function (value, index, values) {
              return value.substring(0, 8) + '...';
            }
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return data.labels[tooltipItem[0].index];
          },
          label: function (tooltipItem, data) {
            return 'Rating: ' + parseFloat(tooltipItem.yLabel).toFixed(2);
          }
        }
      }
    };
  }


  private generateData(statistic: Array<Statistic>, period: Statistic.Period, modifyAmount: (val) => {} = undefined): { labels: Array<string>, datasets: Array<any> } {
    const chartStatisticMap = new Map();
    const months: Array<string> = [];
    let dateFormat: string = period == Statistic.Period.HALF_YEAR ? 'MMM' : 'DD MMM';
    statistic.forEach((statistic: Statistic, index: number) => {
      if (index < Statistic.PeriodCount[period]) {
        if (statistic.created) {
          months.push(format(statistic.created, dateFormat));
        } else {
          months.push(statistic.name);
        }
      }

      if (chartStatisticMap.has(statistic.type)) {
        const dataset = chartStatisticMap.get(statistic.type);
        const amount = typeof modifyAmount == 'function' ? modifyAmount(statistic.amount) : statistic.amount;
        dataset.data.push(amount);
        chartStatisticMap.set(statistic.type, dataset);
      } else {
        const amount = typeof modifyAmount == 'function' ? modifyAmount(statistic.amount) : statistic.amount;
        const dataset = {
          label: capitalize(statistic.type),
          fill: false,
          backgroundColor: StatisticColors[statistic.type],
          borderColor: StatisticColors[statistic.type],
          data: [amount],
        };
        chartStatisticMap.set(statistic.type, dataset);
      }
    });

    return {
      labels: months,
      datasets: Array.from(chartStatisticMap.values())
    };
  }
}
