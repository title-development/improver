import { EventEmitter, Injectable, Input, Output } from '@angular/core';
import { ServiceType, Trade } from "../../model/data-model";
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "./customer-suggestion.service";
import { PopUpMessageService } from "./pop-up-message.service";
import { ServiceTypeService } from "./service-type.service";
import { ProjectActionService } from "./project-action.service";
import { Router } from "@angular/router";
import * as Fuse from "fuse.js";
import { FuseOptions } from "fuse.js";
import { zip } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();
  @Input() isMobileSearchActive: boolean = false;

  allServiceTypes: Array<ServiceType> = [];
  popularServiceTypes: Array<ServiceType> = [];
  allTrades: Array<Trade> = [];
  tradesAndServiceTypes: Array<any> = [];

  tradeAndServiceTypeIndexes;

  constructor(public customerSuggestionService: CustomerSuggestionService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
              private projectActionService: ProjectActionService,
              private router: Router,) {
    this.createTradeAndServiceTypeIndexes();
    this.getPopularServiceTypes();
  }

  getSearchResults(search: string): Array<any> {
    let searchResults: Array<any> = [];
    search = search.trim();
    //Find indexed Service Types if Exists by search term
    if (this.tradeAndServiceTypeIndexes) {
      searchResults = this.tradeAndServiceTypeIndexes.search(search)
        .map(searchResult => this.tradesAndServiceTypes.find(item => searchResult.id == item.id.toString() && searchResult.services == item.services));
    }
    return searchResults;
  }

  autocompleteSearchResult(searchTerm): Array<ServiceType> {
    let filteredServiceTypes: Array<ServiceType> = [];
      if (searchTerm && searchTerm.length > 1) {
        filteredServiceTypes = this.getSearchResults(searchTerm.trim());
      } else {
        filteredServiceTypes = this.popularServiceTypes;
      }
    return filteredServiceTypes;
  }

  getPopularServiceTypes(){
    this.customerSuggestionService.popularServices$
      .subscribe(
        popularServiceTypes => this.popularServiceTypes = popularServiceTypes
      );
  }


  //  ------------------Fuse Options------------------
  // A threshold of 0.0 requires a perfect match, a threshold of 1.0 would match anything.
  // maxPatternLength:100   -   max characters length in search term 100
  // minMatchCharLength:3 -   ignores the return of characters less than three in length
  // keys               -   list of properties that will be searched
  private createTradeAndServiceTypeIndexes() {
    zip(this.customerSuggestionService.getTradesWithServices$(), this.serviceTypeService.serviceTypes$)
      .subscribe(([trades, serviceTypes]) => {
        this.allTrades = trades.map(trade => {
          (trade as any).type = 'trade';
          return trade;
        });
        this.allServiceTypes = serviceTypes;

        this.tradesAndServiceTypes = [...serviceTypes, ...trades];

        if (this.tradesAndServiceTypes.length > 0) {
          let options: FuseOptions<any> = {
            maxPatternLength: 100,
            minMatchCharLength: 2,
            threshold: 0.1,
            tokenize: true,
            matchAllTokens: true,
            //location: 0,
            //distance: 10,
            keys: ['name']
          };
          this.tradeAndServiceTypeIndexes = new Fuse(this.tradesAndServiceTypes, options);
        }
      },
      err => this.popUpService.showError(getErrorMessage(err)));
  }

  findServiceTypeOrTrade(formData): void {
    const found = this.tradesAndServiceTypes.find(item => item.name.toLowerCase() == formData.selectionCtrl.toLowerCase());
    if (found) {
      this.chooseQuestionary(found, formData);
    } else {
      this.chooseQuestionary(formData.selectionCtrl, formData);
    }
  }

  chooseQuestionary(selected, formData): void {
    if (selected && selected.id) {
      this.projectActionService.openQuestionary(selected, formData.zipCodeCtrl);
    } else if (!this.isMobileSearchActive) {
      this.customerSuggestionService.saveUserSearchTerm(selected, formData.zipCodeCtrl, true);
      console.warn('Coincidence is not found. Redirecting to custom search.');
      this.router.navigate(['search'], {queryParams: {service: formData.selectionCtrl, zip: formData.zipCodeCtrl}});
      this.notMatch.emit({service: selected, zip: formData.zipCodeCtrl});
    }
  }

  loadMore(search: string): Array<ServiceType> {
    return  this.tradeAndServiceTypeIndexes.search(search)
      .map(item => this.tradesAndServiceTypes.find(service => item.ref == service.id.toString()));
  }


}
