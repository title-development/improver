import { throwError as observableThrowError, Observable, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Account } from '../../model/data-model';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { CustomerNotificationSettings } from "../models/NotificationSettings";

@Injectable()
export class AccountService {

  accountUrl = 'api/account';
  customersUrl = 'api/customers';
  private notificationsUrl = '/notifications';


  constructor(private http: HttpClient) {
  }

  getAccount(id: string): Observable<Account> {
    return this.http
      .get<Account>(`${this.accountUrl}`)
  }

  updateAccount(id: string, body: Object): Observable<HttpResponse<any>> {
    return this.http
      .put(`${this.accountUrl}/update`, body, {observe: 'response', responseType: 'text'})
  }

  changePassword(body: Object): Observable<HttpResponse<any>> {
    return this.http
      .put(`${this.accountUrl}/password`, body, {observe: 'response', responseType: 'text'});
  }

  changeEmail(id: number, email: string, password: string): Observable<HttpResponse<any>> {
    const params = {
      email: email,
      password: password
    };
    return this.http
      .put(`${this.accountUrl}/email`, params, {observe: 'response', responseType: 'text'});
  }

  updateIconBase64(icon: string): Observable<HttpResponse<any>> {
    return this.http
      .post(`${this.accountUrl}/base64icon`, icon, {observe: 'response', responseType: 'text'})
  }

  deleteIcon(): Observable<any> {
    return this.http.delete(`${this.accountUrl}/icon`);
  }

  restorePasswordRequest(email: string) {
    return this.http.post(`${this.accountUrl}/${email}/reset-password-request`, null, {
      observe: 'response',
      responseType: 'text'
    });
  }

  deleteMyAccount(password: string): Observable<any> {
    return this.http.put(`${this.accountUrl}/delete`, password);
  }




  getLastCustomerZipCode(): Observable<any>{
    return this.http
      .get(`${this.customersUrl}/last-zip`, {responseType: 'text'});
  }

  getRecentSearches(size: any): Observable<Array<string>> {
    const params = new HttpParams();
    params.set('size', size);

    return this.http
      .get<Array<string>>(`${this.customersUrl}/searches`, { params });
  }

  saveSearchTerm(search: string, zipCode: string){
    const params = new HttpParams()
      .set('search', search)
      .set('zipCode', zipCode);
    return this.http.post(`${this.customersUrl}/searches`, params);
  }

  getNotificationSettings(): Observable<CustomerNotificationSettings> {
    return this.http.get<CustomerNotificationSettings>(`${this.customersUrl}${this.notificationsUrl}`);
  }

  updateNotificationSettings(notificationSettings: CustomerNotificationSettings) {
    return this.http.put(`${this.customersUrl}${this.notificationsUrl}`, notificationSettings);
  }



}
