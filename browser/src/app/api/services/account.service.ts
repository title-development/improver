import { throwError as observableThrowError, Observable, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Account } from '../../model/data-model';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

@Injectable()
export class AccountService {
  baseUrl = 'api/users';
  private _lastZipCod$: ReplaySubject<string> = new ReplaySubject<string>(1);

  private lastZipCached: boolean = false;

  constructor(private http: HttpClient) {
  }

  getAccount(id: string): Observable<Account> {
    return this.http
      .get<Account>(`${this.baseUrl}/${id}`)
  }

  updateAccount(id: string, body: Object): Observable<HttpResponse<any>> {
    return this.http
      .put(`${this.baseUrl}/${id}/update`, body, {observe: 'response', responseType: 'text'})
  }

  changePassword(body: Object): Observable<HttpResponse<any>> {
    return this.http
      .put(`${this.baseUrl}/password`, body, {observe: 'response', responseType: 'text'});
  }

  changeEmail(id: number, email: string, password: string): Observable<HttpResponse<any>> {
    const params = {
      email: email,
      password: password
    };
    return this.http
      .put(`${this.baseUrl}/${id}/email`, params, {observe: 'response', responseType: 'text'});
  }

  updateIconBase64(icon: string): Observable<HttpResponse<any>> {
    return this.http
      .post(`${this.baseUrl}/base64icon`, icon, {observe: 'response', responseType: 'text'})
  }

  get LastCustomerZipCode$(): ReplaySubject<string> {
    if (!this.lastZipCached) {
      this.lastZipCached = true;
      this.getLastCustomerZipCode().subscribe(lastCustomerZipCode => {
          if (!lastCustomerZipCode){
            this.lastZipCached = false;
          }
          this._lastZipCod$.next(lastCustomerZipCode);
        },
        error => {
          this.lastZipCached = false;
          console.log(error);
        });
    }
    return this._lastZipCod$;
  }

  getLastCustomerZipCode(): Observable<any>{
    return this.http
      .get(`${this.baseUrl}/last-zip`, {responseType: 'text'});
  }

  deleteIcon(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/icon`);
  }

}
