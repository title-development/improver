import { EventEmitter, Injectable, Output } from '@angular/core';
import { ReplaySubject } from "rxjs";
import { ServiceType, NameIdImageTuple, Trade } from "../../model/data-model";
import { AccountService } from "./account.service";
import { ServiceTypeService } from "./service-type.service";
import { tap } from "rxjs/operators";
import { SecurityService } from "../../auth/security.service";
import { TradeService } from "./trade.service";

@Injectable({
  providedIn: 'root'
})
export class CustomerSuggestionService {

  @Output() onZipChange: EventEmitter<string> = new EventEmitter<string>();

  private _lastZipCode$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private _popularServices$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _popularTrades$: ReplaySubject<Array<NameIdImageTuple>> = new ReplaySubject<Array<NameIdImageTuple>>(1);
  private _suggestedServiceTypes$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _suggestedTrades$: ReplaySubject<Array<Trade>> = new ReplaySubject<Array<Trade>>(1);
  private _recentSearches$: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>(1);
  private _tradeWithServices$: ReplaySubject<Array<Trade>> = new ReplaySubject<Array<Trade>>(1);

  private lastZipCached: boolean = false;
  private popularServiceTypeCached: boolean = false;
  private suggestedServiceTypesCached: boolean = false;
  private suggestedTradesCached: boolean = false;
  private popularTradesCached: boolean = false;
  private tradeWithServicesCached: boolean = false;
  public suggestedTradesSize: number = 8;

  readonly maxSearchStringSize: number = 150;

  constructor(private accountService: AccountService,
              private securityService: SecurityService,
              private serviceTypeService: ServiceTypeService,
              private tradeService: TradeService){
  }


  get suggestedServiceTypes$(): ReplaySubject<Array<ServiceType>> {
    if (!this.suggestedServiceTypesCached) {
      this.suggestedServiceTypesCached = true;
      this.serviceTypeService.getSuggested(16).subscribe((serviceType: Array<ServiceType>) => {
        if (!serviceType){
          this.suggestedServiceTypesCached = false;
        }
        this._suggestedServiceTypes$.next(serviceType);
      }, err => {
        this.suggestedServiceTypesCached = false;
        console.error(err);
      });
    }

    return this._suggestedServiceTypes$;
  }

  get popularTrades$(): ReplaySubject<Array<NameIdImageTuple>> {
    if (!this.popularTradesCached) {
      this.popularTradesCached = true;
      this.tradeService.getPopular(16).subscribe((serviceTypes: Array<NameIdImageTuple>) => {
        if (!serviceTypes){
          this.popularTradesCached = false;
        }
        this._popularTrades$.next(serviceTypes);
      }, err => {
        this.popularTradesCached = false;
        console.error(err);
      });
    }

    return this._popularTrades$;
  }

  get suggestedTrades$(): ReplaySubject<Array<Trade>> {
    if (!this.suggestedTradesCached) {
      this.suggestedTradesCached = true;
      this.tradeService.getSuggested(this.suggestedTradesSize).subscribe((trades: Array<Trade>) => {
        if (!trades){
          this.suggestedTradesCached = false;
        }
        this._suggestedTrades$.next(trades);
        this.resetTradesSize();
      }, err => {
        this.suggestedTradesCached = false;
        console.error(err);
      });
    }

    return this._suggestedTrades$;
  }

  getTradesWithServices$(): ReplaySubject<Array<Trade>>{
    if (!this.tradeWithServicesCached){
      this.tradeWithServicesCached = true;
      this.tradeService.getTradesWithServices().subscribe(trade => {
        if (!trade){
          this.tradeWithServicesCached = false;
        }
        this._tradeWithServices$.next(trade);
      },
        err => {
        this.tradeWithServicesCached = false;
        console.error(err);
        })
    }

    return this._tradeWithServices$;
  }

  get lastCustomerZipCode$(): ReplaySubject<string> {
    let zipCodeFromStorage = localStorage.getItem('zipCode');
    if (zipCodeFromStorage) {
      this._lastZipCode$.next(zipCodeFromStorage);
    } else if (!this.lastZipCached){
      this.lastZipCached = true;
      this.accountService.getLastCustomerZipCode().subscribe(lastCustomerZipCode => {
          this._lastZipCode$.next(lastCustomerZipCode);
        },
        err => {
          this.lastZipCached = false;
          console.error(err);
        });
    }

    return this._lastZipCode$;
  }

  get popularServices$(): ReplaySubject<Array<ServiceType>> {
    if (!this.popularServiceTypeCached) {
      this.popularServiceTypeCached = true;
      this.serviceTypeService.getPopular(16).subscribe((serviceType: Array<ServiceType>) => {
        if (!serviceType){
          this.popularServiceTypeCached = false;
        }
        this._popularServices$.next(serviceType);
      }, err => {
        this.popularServiceTypeCached = false;
        console.error(err);
      });
    }

    return this._popularServices$;
  }

  getCustomerRecentSearches$(): ReplaySubject<Array<string>> {
    this.accountService.getRecentSearches(5).subscribe(
      (recentSearch: Array<string>) => this._recentSearches$.next(recentSearch),
      err => console.error(err)
    );
    return this._recentSearches$;
  }

  saveUserSearchTerm(search: string, zipCode: string, isManual: boolean){
    if (search.length > this.maxSearchStringSize){
      search = search.substring(0, this.maxSearchStringSize);
    }

    localStorage.setItem('zipCode', zipCode);
    this.accountService.saveSearchTerm(search, zipCode, isManual).pipe(
      tap(result => {
        if (this.securityService.isAuthenticated()){
          this.getCustomerRecentSearches$();
        }
      })
    ).subscribe();
    this.onZipChange.emit(zipCode);
  }

  resetTradesSize() {
  	let defaultTradesSize: number = 8;
    this.suggestedTradesSize = defaultTradesSize;
  }
}
