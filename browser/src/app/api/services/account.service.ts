import { throwError as observableThrowError, Observable } from 'rxjs';
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

  changePassword(id: string, body: Object): Observable<HttpResponse<any>> {
    return this.http
      .put(`${this.baseUrl}/${id}/password`, body, {observe: 'response', responseType: 'text'});
  }

  changeEmail(id: number, email: string, password: string): Observable<HttpResponse<any>> {
    const params = {
      email: email,
      password: password
    };
    return this.http
      .put(`${this.baseUrl}/${id}/email`, params, {observe: 'response', responseType: 'text'});
  }

  updateIconBase64(id: string, icon: string): Observable<HttpResponse<any>> {
    return this.http
      .post(`${this.baseUrl}/${id}/base64icon`, icon, {observe: 'response', responseType: 'text'})
  }

  deleteIcon(accountId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${accountId}/icon`);
  }

}
