import { Component, OnInit } from '@angular/core';
import { ServiceType, Trade } from "../../model/data-model";
import { ServiceTypeService } from "../../api/services/service-type.service";
import { TradeService } from "../../api/services/trade.service";
import { ProjectActionService } from "../../api/services/project-action.service";
import { CustomerSuggestionService } from "../../api/services/customer-suggestion.service";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { clone, getErrorMessage, removeDuplicatesFromArray } from "../../util/functions";
import { SearchHolder } from "../../util/search-holder";

@Component({
  selector: 'all-services-page',
  templateUrl: './all-services.component.html',
  styleUrls: ['./all-services.component.scss']
})
export class AllServicesComponent implements OnInit {

  searchResultMessageText: string = '';
  model = '';
  trades: Trade[] = [];
  allTradesAndServiceTypes: ServiceType[] = [];
  filteredTrades: Trade[] = [];
  searchHolder: SearchHolder<any>

  constructor(private serviceTypesService: ServiceTypeService,
              private tradeService: TradeService,
              private customerSuggestionService: CustomerSuggestionService,
              public projectActionService: ProjectActionService,
              private popUpMessageService: PopUpMessageService) {

    this.getTrades();

  }

  ngOnInit() {
  }

  getTrades() {
    this.customerSuggestionService.getTradesWithServices$().subscribe(
      trades => {
        this.trades = trades;
        this.filteredTrades = trades

        clone(this.trades).forEach(trade => {
          let services = trade.services
          delete trade.services;
          this.allTradesAndServiceTypes.push(trade)
          this.allTradesAndServiceTypes.push(...services)
          services.forEach(service => service.tradeId = trade.id)
        })

        let skipFilter = el => el.tradeId == undefined;

        this.allTradesAndServiceTypes = removeDuplicatesFromArray(this.allTradesAndServiceTypes, "id", skipFilter)

        this.searchHolder = new SearchHolder<ServiceType>(this.allTradesAndServiceTypes)
        this.onFilter('');
      },
      err => {
        console.error(err);
        this.popUpMessageService.showError(getErrorMessage(err))
      });
  }

  onFilter(searchTerm) {

    if(!searchTerm) {
      this.filteredTrades = clone(this.trades);
      return
    } else {
      setTimeout(() => {
        let searchResults = this.searchHolder.search(searchTerm);

        if (searchResults.length == 0){
          this.searchResultMessageText = 'No results were found for \"' + searchTerm + '\".';
          this.filteredTrades = [];
          return;
        } else {
          this.searchResultMessageText = '';
        }

        let fullTradeIds = new Set();
        let tradeIds = new Set();
        let serviceTypeIds = new Set();

        searchResults.forEach(item => {
          if (item.tradeId) {
            tradeIds.add(item.tradeId)
            serviceTypeIds.add(item.id)
          } else {
            fullTradeIds.add(item.id)
          }

        })

        this.filteredTrades = clone(this.trades).filter(trade => {
          if (tradeIds.has(trade.id) && !fullTradeIds.has(trade.id)) {
            trade.services = trade.services.filter(serviceType => serviceTypeIds.has(serviceType.id))
            return true;
          } else if (fullTradeIds.has(trade.id)) {
            return true;
          } else {
            return false;
          }
        })

      })
    }

  }

  trackByFn(index: number, item: any): any {
    return item;
  }

}


