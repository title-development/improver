import { Component, OnInit } from '@angular/core';
import { ServiceType, Trade } from "../../model/data-model";
import { ServiceTypeService } from "../../api/services/service-type.service";
import { TradeService } from "../../api/services/trade.service";
import { ProjectActionService } from "../../util/project-action.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";

@Component({
  selector: 'all-services-page',
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss']
})
export class AllServicesComponent implements OnInit {
  model = '';
  trades: Trade[] = [];
  filteredTrades: Trade[] = [];

  constructor(private serviceTypesService: ServiceTypeService,
              private tradeService: TradeService,
              private customerSuggestionService: CustomerSuggestionService,
              public projectActionService: ProjectActionService) {

    this.getTrades();

  }

  ngOnInit() {
  }

  getTrades() {
    this.customerSuggestionService.tradesWithServices.subscribe(
      trades => {
        this.trades = trades;
        this.onFilter('');
      },
      err => {
        console.log(err);
      });
  }

  onFilter(searchTerm) {
    if (searchTerm == '') {
      this.filteredTrades = this.trades;
      return;
    } else {

      this.filteredTrades = [];

      for (let trade of this.trades) {
        let filteredTrade = {
          id: trade.id,
          name: trade.name,
          services: []
        };
        let services = [];

        for (let service of trade.services) {
          let regex = new RegExp(searchTerm, 'gi');
          if (regex.test(service.name)) {
            services.push(service)
          }
        }

        if (services.length > 0) {
          filteredTrade.services = services;
          this.filteredTrades.push(filteredTrade)
        }

      }

    }

  }

  trackByFn(index: number, item: any): any {
    return item;
  }

}
