import { Component, Directive, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ActivatedRoute } from '@angular/router';
import { LeadsReport, MonthReport } from '../../../../api/models/LeadsReport';
import { chartColors } from './chart.options';
import { ChartDataSets, ChartOptions } from "chart.js";
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Directive()
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

  Math = Math;
  datasets = [{
    label: '',
    borderWidth: 2,
    data: []
  }];
  chartData: MoneySpentModel;
  chartJsColors = chartColors;
  barChartPlugins = [ pluginDataLabels ];
  chartJsOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
        font: {
          size: 14,
        },
        formatter: (value, context) => {
          return '$' + (value).toFixed(0);
        },
      }
    },
    elements: {
      point: {
        radius: 3,
        borderWidth: 2,
      }
    },
    tooltips: {
      enabled: true,
			intersect: false,
      position: 'nearest',
			backgroundColor: '#FFFFFF',
			bodyFontColor: '#273149',
			borderColor: '#9e9e9e',
			borderWidth: 0.3,
			xPadding: 6,
			bodyAlign: "center",
			caretPadding: 0,
			custom: function(tooltip) {
				if (!tooltip) return;
				// disable displaying the color box;
				tooltip.displayColors = false;
			},
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
    let activeMonthsCount: number = 0;
    let activityMonths: Array<number> = [];
    let i = 0;
    for (const val of data) {
      chartNumbers.push(Math.round(val.spend / 100));
      chartLabels.push(val.month.substring(0, 3));
      if (i != 0) {
        total += val.spend;
        deals += val.deals;
      }

      if (val.deals != 0){
        activeMonthsCount++
      }
      activityMonths.push(val.deals);
      i++;
    }
    deals = Math.ceil(deals / 6);
    if (activeMonthsCount != 0) {
      total = Math.round((total / 100) / activeMonthsCount);
    }
    chartNumbers.push((this.leadsReport.current.subscriptionSpend + this.leadsReport.current.payAndGoSpend) / 100);
    chartLabels.push('');
    this.datasets[0].data = chartNumbers;
    this.chartJsOptions.tooltips.callbacks = {

			title: function(tooltipItem, data) {
				return '';
			},

			label: function(tooltipItem, data) {
				if (typeof activityMonths[tooltipItem.index] === 'undefined'){
					return;
				}
				return activityMonths[tooltipItem.index] + ' leads';
			},

		};
    this.chartData = new MoneySpentModel(chartNumbers, chartLabels, total, deals);
    this.forceChartRefresh();
  }

}
