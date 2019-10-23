import { Injectable } from '@angular/core';
import { ReplaySubject } from "rxjs";
import { ServiceType } from "../../model/data-model";
import { AccountService } from "./account.service";
import { ServiceTypeService } from "./service-type.service";
import { tap } from "rxjs/operators";
import { SecurityService } from "../../auth/security.service";

@Injectable({
  providedIn: 'root'
})
export class CustomerSuggestionService {

  private _lastZipCode$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private _popular$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _suggested$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _recentSearches$: ReplaySubject<Array<string>> = new ReplaySubject<Array<string>>(1);

  private lastZipCached: boolean = false;
  private popularServiceTypeCached: boolean = false;
  private suggestedServiceTypeCached: boolean = false;

  constructor(private accountService: AccountService,
              private securityService: SecurityService,
              private serviceTypeService: ServiceTypeService){
  }


  get suggested$(): ReplaySubject<Array<ServiceType>> {
    if (!this.suggestedServiceTypeCached) {
      this.suggestedServiceTypeCached = true;
      this.serviceTypeService.getSuggested(16).subscribe((serviceType: Array<ServiceType>) => {
        if (!serviceType){
          this.suggestedServiceTypeCached = false;
        }
        this._suggested$.next(serviceType);
      }, err => {
        this.suggestedServiceTypeCached = false;
        console.log(err);
      });
    }

    return this._suggested$;
  }

  get recentSearches$(): ReplaySubject<Array<string>> {
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

  saveUserSearchTerm(search: any, zipCode: any){
    localStorage.setItem('zipCode', zipCode);
    this.accountService.saveSearchTerm(search, zipCode).pipe(
      tap(result => {
        if (this.securityService.isAuthenticated()){
          this.recentSearches$;
        }
      })
    ).subscribe();
  }
}
