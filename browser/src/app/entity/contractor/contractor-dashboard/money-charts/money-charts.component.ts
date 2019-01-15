import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { LeadsReport, MonthReport } from '../../../../api/models/LeadsReport';
import { chartColors } from './chart.oprions';

class MoneySpentModel {
  chartsNumbers: Array<number>;
  chartLabels: Array<string>;
  total: number;
  deals: number;
  @Input() leadsReport: LeadsReport;

  constructor(chartsNumbers: Array<number>, chartLabels: Array<string>, total: number, deals: number) {
    this.chartsNumbers = chartsNumbers;
    this.chartLabels = chartLabels;
    this.total = total;
    this.deals = deals;
  }
}

@Component({
  selector: 'contractor-money-charts',
  templateUrl: './money-charts.component.html',
  styleUrls: ['./money-charts.component.scss']
})
export class MoneyChartsComponent implements OnInit, OnChanges {
  @Input() leadsReport: LeadsReport;
  @ViewChild("tooltip") tooltipEl;
  chartData: MoneySpentModel;
  chartJsColors = chartColors;
  chartJsOptions = {
    responsive: true,
    lineTension: 0,
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 3,
        borderWidth: 2,
      }
    },
    tooltips: {
      enabled: false,
      mode: 'index',
      position: 'nearest',
      custom: (tooltip) => this.htmlTooltip(tooltip)
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 30,
        bottom: 0
      }
    },
    legend: {
      display: false,
      labels: {
        fontColor: 'rgb(0, 0, 0)'
      }
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines: {
          display: false
        }
      }],
      yAxes: [{
        display: false,
        gridLines: {
          display: false
        }
      }]
    },
  };
  datasets = [{
    lineTension: 0,
    label: '',
    borderWidth: 2,
    data: []
  }];
  tooltipData = {
    price: 0,
    opacity: 0,
    top: 0,
    left: 0
  };
  tooltipPrice: number;

  @ViewChild(BaseChartDirective) private _chart;

  constructor(private route: ActivatedRoute) {
  }

  ngOnChanges(changes): void {
    if (changes.leadsReport && changes.leadsReport.currentValue) {
      this.updateChart(this.leadsReport.past);
    }
  }

  ngOnInit(): void {
  }

  htmlTooltip(tooltip) {
    const tooltipEl = this.tooltipEl.nativeElement;
    if (tooltip.body) {
      this.tooltipData.price = tooltip.body.map(item => item.lines)[0] * 1;
    }
    if (tooltip.opacity === 0) {
      this.tooltipData.opacity = 0;
      return;
    }

    const positionY = this._chart.cvs.offsetTop;
    const positionX = this._chart.cvs.offsetLeft;
    const offset = (this._chart.cvs.offsetWidth - document.getElementById('tooltip-holder').offsetWidth) / 2;
    this.tooltipData.opacity = 1;
    this.tooltipData.left = positionX + tooltip.caretX - offset;
    this.tooltipData.top  = positionY + tooltip.caretY;
  }


  private forceChartRefresh(): void {
    if (this._chart) {
      setTimeout(() => {
        this._chart.refresh();
      }, 10);
    }
  }

  //todo add Month validatation
  private updateChart(data: Array<MonthReport>): void {
    let chartNumbers: Array<number> = [];
    let chartLabels: Array<string> = [];
    let total: number = 0;
    let deals: number = 0;
    let i = 0;
    for (const val of data) {
      chartNumbers.push(val.spend / 100);
      chartLabels.push(val.month.substring(0, 3));
      if (i != 0) {
        total += val.spend;
        deals += val.deals;
      }
      i++;
    }
    deals = Math.ceil(deals / 6);
    chartNumbers.push((this.leadsReport.current.subscriptionSpend + this.leadsReport.current.payAndGoSpend) / 100);
    chartLabels.push('');
    this.datasets[0].data = chartNumbers;
    this.chartData = new MoneySpentModel(chartNumbers, chartLabels, total, deals);
    this.forceChartRefresh();
  }

}
