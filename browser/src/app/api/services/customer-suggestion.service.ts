import { Injectable } from '@angular/core';
import { ReplaySubject } from "rxjs";
import { ServiceType } from "../../model/data-model";
import { AccountService } from "./account.service";
import { ServiceTypeService } from "./service-type.service";

@Injectable({
  providedIn: 'root'
})
export class CustomerSuggestionService {
//TODO move all methods
  private _lastZipCod$: ReplaySubject<string> = new ReplaySubject<string>(1);
  private _popular$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);
  private _suggested$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);

  private lastZipCached: boolean = false;
  private popularServiceTypeCached: boolean = false;
  private suggestedServiceTypeCached: boolean = false;

  constructor(private accountService: AccountService,
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

  get LastCustomerZipCode$(): ReplaySubject<string> {
    if (!this.lastZipCached) {
      this.lastZipCached = true;
      this.accountService.getLastCustomerZipCode().subscribe(lastCustomerZipCode => {
          if (!localStorage.getItem('zipCode') && lastCustomerZipCode) {
            this._lastZipCod$.next(lastCustomerZipCode);
            localStorage.setItem('zipCode', lastCustomerZipCode);
          } else {
            this._lastZipCod$.next(localStorage.getItem('zipCode'));
            this.lastZipCached = false;
          }
        },
        error => {
          this.lastZipCached = false;
          console.log(error);
        });
    }
    return this._lastZipCod$;
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
    this.accountService.saveSearchTerm(search, zipCode).subscribe()
  }
}
