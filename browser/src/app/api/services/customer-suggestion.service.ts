import { EventEmitter, Injectable, Output } from '@angular/core';
import { ReplaySubject } from "rxjs";
import { ServiceType, Trade } from "../../model/data-model";
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
  private _popular$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _suggestedServiceTypes$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _suggestedTrades$: ReplaySubject<Array<Trade>> = new ReplaySubject<Array<ServiceType>>(1);
  private _recentSearches$: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>(1);
  private _tradeWithServices$: ReplaySubject<Array<Trade>> = new ReplaySubject<Array<Trade>>(1);

  private lastZipCached: boolean = false;
  private popularServiceTypeCached: boolean = false;
  private suggestedServiceTypesCached: boolean = false;
  private suggestedTradesTypesCached: boolean = false;
  private tradeWithServicesCached: boolean = false;

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
        console.log(err);
      });
    }

    return this._suggestedServiceTypes$;
  }

  get suggestedTrades$(): ReplaySubject<Array<Trade>> {
    if (!this.suggestedServiceTypesCached) {
      this.suggestedTradesTypesCached = true;
      this.tradeService.getSuggested(8).subscribe((trades: Array<Trade>) => {
        if (!trades){
          this.suggestedTradesTypesCached = false;
        }
        this._suggestedTrades$.next(trades);
      }, err => {
        this.suggestedTradesTypesCached = false;
        console.log(err);
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
        error => {
        this.tradeWithServicesCached = false;
        console.log(error);
        })
    }

    return this._tradeWithServices$;
  }

  getCustomerRecentSearches$(): ReplaySubject<Array<string>> {
      this.accountService.getRecentSearches(5).subscribe(
        (recentSearch: Array<string>) => this._recentSearches$.next(recentSearch),
        err => console.log(err)
      );
    return this._recentSearches$;
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
        error => {
          this.lastZipCached = false;
          console.log(error);
        });
    }

    return this._lastZipCode$;
  }

  get popular$(): ReplaySubject<Array<ServiceType>> {
    if (!this.popularServiceTypeCached) {
      this.popularServiceTypeCached = true;
      this.serviceTypeService.getPopular(16).subscribe((serviceType: Array<ServiceType>) => {
        if (!serviceType){
          this.popularServiceTypeCached = false;
        }
        this._popular$.next(serviceType);
      }, err => {
        this.popularServiceTypeCached = false;
        console.log(err);
      });
    }

    return this._popular$;
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
}
