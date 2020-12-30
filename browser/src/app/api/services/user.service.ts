import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { RestPage } from '../models/RestPage';
import { Pagination } from '../../model/data-model';
import { AdminContractor } from '../models/AdminContractor';
import { HttpParamsEncoder } from "../../util/http-param-encoder";


@Injectable()
export class UserService {

  private url = 'api/users';

  constructor(private http: HttpClient,
              private encoder: HttpParamsEncoder) {
  }

  getAll(params, pagination): Observable<RestPage<User>> {
    params = new HttpParams({ fromObject: {...params, ...pagination}, encoder: this.encoder });
    return this.http.get<RestPage<User>>(this.url, {params: params});
  }

  getStaff(pagination): Observable<RestPage<User>> {
    return this.http.get<RestPage<User>>(`${this.url}/staff`, {params: null});
  }

  updateUser(userId: number, user: User): Observable<any> {
    return this.http.put(`${this.url}/${userId}`, user, {responseType: 'text'});
  }


  getAllContractors(params: any, pagination: Pagination): Observable<RestPage<AdminContractor>> {
    params = new HttpParams({ fromObject: {...params, ...pagination}, encoder: this.encoder });
    return this.http.get<RestPage<AdminContractor>>(`${this.url}/contractors`, {params});
  }

  updateContractor(contractorId: number, contractor: AdminContractor): Observable<any> {

    return this.http.put(`${this.url}/${contractorId}/contractors`, contractor);
  }

  getAllCustomers(params: any, pagination: Pagination): Observable<RestPage<User>> {
    params = new HttpParams({ fromObject: {...params, ...pagination}, encoder: this.encoder });
    return this.http.get<RestPage<User>>(`${this.url}/customers`, {params});
  }

  updateCustomers(customerId: number, customer: User): Observable<any> {
    return this.http.put(`${this.url}/${customerId}/customers`, customer);
  }

  deleteAccount(userId: any): Observable<any> {
    return this.http.put(`${this.url}/${userId}/delete`, null);
  }


  restoreAccount(userId: any): Observable<any> {
    return this.http.put(`${this.url}/${userId}/restore`, {});
  }

  // TODO: this should be changed
  isEmailFree(email: string): Observable<any> {
    return this.http
      .get(`${this.url}/isEmailFree/?email=${email}`, { observe: 'response', responseType: 'text' });
  }


  blockUser(userId: any, blocked: boolean): Observable<any> {
    const params = new HttpParams()
      .set('blocked', blocked.toString());
    return this.http.put(`${this.url}/${userId}/block`, {}, {params});
  }

}
