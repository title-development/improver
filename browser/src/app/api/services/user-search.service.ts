import { EventEmitter, Injectable, Output } from '@angular/core';
import { ServiceType, Trade } from "../../model/data-model";
import * as lunr from "lunr";
import { getErrorMessage } from "../../util/functions";
import { CustomerSuggestionService } from "./customer-suggestion.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { ServiceTypeService } from "./service-type.service";
import { ProjectActionService } from "../../util/project-action.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  @Output() notMatch: EventEmitter<any> = new EventEmitter<any>();

  allServiceTypes: Array<ServiceType> = [];
  allTrades: Array<Trade> = [];

  tradeIndexes: lunr.Index;
  serviceTypeIndexes: lunr.Index;

  readonly searchTermMinLength: number = 3;

  constructor(public customerSuggestionService: CustomerSuggestionService,
              private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
              private projectActionService: ProjectActionService,
              private router: Router,) {
    this.createTradeIndexes();
    this.createServiceTypeIndexes();
  }

  // * - wildcards is represented as an asterisk (*) and can appear anywhere in a search term
  // ~ - fuzziness in chars is applied by appending a tilde
  // ^ - in multi-term searches, a single term may be important than others
  getSearchQuery(search: string): string{
    if (search.length < this.searchTermMinLength){
      // Give more priority to the words on the beginning of a sentence as others words
      return `${search}*^10 ${search}^9`;
    } else {
      // Give more priority to the words on the beginning of a sentence as others words and
      // lower priority to words with fuzziness in one character(~1) on the beginning of a sentence as others words
      return `${search}*^10 ${search}^9 ${search}*~1^8 ${search}~1^7`
    }
  }

  getSearchResults(search: string): Array<ServiceType> {
    let searchResult: Array<ServiceType> = [];
    let filteredTrades: Array<Trade> = [];
    let searchTerm: string = this.getSearchQuery(search);

    //Find indexed Service Types if Exists by search term
    if(this.serviceTypeIndexes) {
      searchResult = this.serviceTypeIndexes.search(searchTerm)
        .map(item => this.allServiceTypes.find(service => item.ref == service.id.toString()));
    }

    // Service Types not exists get Service Types on indexed Trades by search term
    if (searchResult.length == 0 && this.tradeIndexes){
      filteredTrades = this.tradeIndexes.search(searchTerm)
        .map(item => this.allTrades.find(trade => item.ref == trade.id.toString()));
      let services = [];
      filteredTrades.forEach( trade => {
        trade.services.forEach(service => services.push(service));
      });
      searchResult = services;
    }

    return searchResult;
  }

  createTradeIndexes(): void {
    this.customerSuggestionService.getTradesWithServices$().subscribe(
      trades => {
        if (trades && trades.length >0){
          this.tradeIndexes = lunr( function () {
            this.ref('id');
            this.field('name');
            trades.forEach(trade => this.add(trade));
          });
          this.allTrades = trades;
        }
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }

  createServiceTypeIndexes(): void {
    this.serviceTypeService.serviceTypes$.subscribe(
      serviceTypes => {
        if (serviceTypes && serviceTypes.length > 0) {
          this.serviceTypeIndexes = lunr(function () {
            this.ref('id');
            this.field('name');
            serviceTypes.forEach(service => this.add(service));
          });
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
    } else {
      this.customerSuggestionService.saveUserSearchTerm(serviceType, formData.zipCodeCtrl, true);
      console.warn('Service type is not found. Redirecting to custom search.');
      this.router.navigate(['search'], {queryParams: {service: formData.serviceTypeCtrl, zip: formData.zipCodeCtrl}});
      this.notMatch.emit({service: serviceType, zip: formData.zipCodeCtrl});
    }
  }

  loadMore(search: string): Array<ServiceType> {
    return  this.serviceTypeIndexes.search(this.getSearchQuery(search))
      .map(item => this.allServiceTypes.find(service => item.ref == service.id.toString()));
  }

}
