import { EventEmitter, Injectable, Input, Output } from '@angular/core';
import { ServiceType, Trade } from "../../model/data-model";
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "./customer-suggestion.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { ServiceTypeService } from "./service-type.service";
import { ProjectActionService } from "../../util/project-action.service";
import { Router } from "@angular/router";
import * as Fuse from "fuse.js";
import { FuseOptions } from "fuse.js";

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();
  @Input() isMobileSearchActive: boolean;

  allServiceTypes: Array<ServiceType> = [];
  allTrades: Array<Trade> = [];

  tradeIndexes;
  serviceTypeIndexes;

  constructor(public customerSuggestionService: CustomerSuggestionService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
              private projectActionService: ProjectActionService,
              private router: Router,) {
    this.createTradeIndexes();
    this.createServiceTypeIndexes();
  }

  getSearchResults(search: string): Array<ServiceType> {
    let searchResult: Array<ServiceType> = [];
    let filteredTrades: Array<Trade> = [];

    //Find indexed Service Types if Exists by search term
    if (this.serviceTypeIndexes) {
      searchResult = this.serviceTypeIndexes.search(search)
        .map(item => this.allServiceTypes.find(service => item.id == service.id.toString()));
    }

    // Service Types not exists get Service Types on indexed Trades by search term
    if (searchResult.length == 0 && this.tradeIndexes) {
      filteredTrades = this.tradeIndexes.search(search)
        .map(item => this.allTrades.find(trade => item.id == trade.id.toString()));
      let services = [];
      filteredTrades.forEach(trade => {
        trade.services.forEach(service => services.push(service));
      });
      searchResult = services;
    }

    return searchResult;
  }


  //  ------------------Fuse Options------------------
  // A threshold of 0.0 requires a perfect match, a threshold of 1.0 would match anything.
  // maxPatternLength:100   -   max characters length in search term 100
  // minMatchCharLength:3 -   ignores the return of characters less than three in length
  // keys               -   list of properties that will be searched
  createTradeIndexes(): void {
    this.customerSuggestionService.getTradesWithServices$().subscribe(
      trades => {
        if (trades && trades.length >0){
          let options: FuseOptions<Trade> = {
            threshold: 0.5,
            maxPatternLength: 100,
            minMatchCharLength: 3,
            keys: ['name']
          };
          this.tradeIndexes = new Fuse(trades, options);
          this.allTrades = trades;
        }
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }

  createServiceTypeIndexes(): void {
    this.serviceTypeService.serviceTypes$.subscribe(
      serviceTypes => {
        if (serviceTypes && serviceTypes.length > 0) {
          let options: FuseOptions<ServiceType> = {
            threshold: 0.2,
            maxPatternLength: 100,
            minMatchCharLength: 3,
            keys: ['name']
          };
          this.serviceTypeIndexes = new Fuse(serviceTypes, options);
          this.allServiceTypes = serviceTypes;
        }
      },
      err => this.popUpService.showError(getErrorMessage(err)));
  }

  findServiceType(formData): void {
    const filtered = this.allServiceTypes.filter(item => item.name.toLowerCase() == formData.serviceTypeCtrl.toLowerCase());
    if (filtered.length > 0) {
      this.chooseQuestionary(filtered[0], formData);
    } else {
      this.chooseQuestionary(formData.serviceTypeCtrl, formData);
    }
  }

  chooseQuestionary(serviceType, formData): void {
    if (serviceType.id) {
      this.projectActionService.openQuestionary(serviceType, formData.zipCodeCtrl);
    } else if (!this.isMobileSearchActive) {
      this.customerSuggestionService.saveUserSearchTerm(serviceType, formData.zipCodeCtrl, true);
      console.warn('Service type is not found. Redirecting to custom search.');
      this.router.navigate(['search'], {queryParams: {service: formData.serviceTypeCtrl, zip: formData.zipCodeCtrl}});
      this.notMatch.emit({service: serviceType, zip: formData.zipCodeCtrl});
    }
  }

  loadMore(search: string): Array<ServiceType> {
    return  this.serviceTypeIndexes.search(search)
      .map(item => this.allServiceTypes.find(service => item.ref == service.id.toString()));
  }

}
