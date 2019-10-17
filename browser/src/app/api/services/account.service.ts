import { throwError as observableThrowError, Observable, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Account } from '../../model/data-model';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';

@Injectable()
export class AccountService {
  baseUrl = 'api/users';


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

  getLastCustomerZipCode(): Observable<any>{
    return this.http
      .get(`${this.baseUrl}/last-zip`, {responseType: 'text'});
  }

  saveSearchTerm(search: string, zipCode: string){
    const params = new HttpParams()
      .set('search', search)
      .set('zipCode', zipCode);
    return this.http.post(`${this.baseUrl}/searches`, params);
  }

  deleteIcon(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/icon`);
  }

}
