import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { RestPage } from '../models/RestPage';
import { ContractorNotificationSettings, CustomerNotificationSettings } from '../models/NotificationSettings';
import { Pagination } from '../../model/data-model';
import { AdminContractor } from '../models/AdminContractor';
import { RegistrationUserModel } from '../../model/security-model';


@Injectable()
export class UserService {

  private url = 'api/users';
  private notificationsUrl = '/notifications';

  constructor(private http: HttpClient) {
  }

  getAll(params, pagination): Observable<RestPage<User>> {
    params = Object.assign(params, ...pagination);
    return this.http.get<RestPage<User>>(this.url, {params: params});
  }

  archiveUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${userId}/archive`);
  }

  updateUser(userId: number, user: User): Observable<any> {
    return this.http.put(`${this.url}/${userId}`, user, {responseType: 'text'});
  }

  restorePasswordRequest(email: string) {
    return this.http.post(`${this.url}/${email}/restorePasswordRequest`, null, {
      observe: 'response',
      responseType: 'text'
    });
  }


  getNotificationSettings(userId: any): Observable<CustomerNotificationSettings> {
    return this.http.get<CustomerNotificationSettings>(`${this.url}/${userId}${this.notificationsUrl}`);
  }

  updateNotificationSettings(userId: any, notificationSettings: CustomerNotificationSettings) {
    return this.http.put(`${this.url}/${userId}${this.notificationsUrl}`, notificationSettings);
  }

  getAllContractors(filters: any, pagination: Pagination): Observable<RestPage<AdminContractor>> {
    const params = {...filters, ...pagination};

    return this.http.get<RestPage<AdminContractor>>(`${this.url}/contractors`, {params});
  }

  updateContractor(contractorId: number, contractor: AdminContractor): Observable<any> {

    return this.http.put(`${this.url}/${contractorId}/contractors`, contractor);
  }

  getAllCustomers(filters: any, pagination: Pagination): Observable<RestPage<User>> {
    const params = {...filters, ...pagination};
    return this.http.get<RestPage<User>>(`${this.url}/customers`, {params});
  }

  updateCustomers(customerId: number, customer: User): Observable<any> {
    return this.http.put(`${this.url}/${customerId}/customers`, customer);
  }

  deleteAccount(userId: any): Observable<any> {
    return this.http.put(`${this.url}/${userId}/delete`, null);
  }

  deleteMyAccount(password: string): Observable<any> {
    return this.http.put(`${this.url}/delete`, password);
  }


  restoreAccount(userId: any): Observable<any> {
    return this.http.put(`${this.url}/${userId}/restore`, {});
  }

  isEmailFree(email: string): Observable<any> {
    return this.http
      .get(`${this.url}/isEmailFree/?email=${email}`, { observe: 'response', responseType: 'text' });
  }


  blockUser(userId: any, blocked: boolean): Observable<any> {
    const params = new HttpParams()
      .set('blocked', blocked.toString());
    return this.http.put(`${this.url}/${userId}/block`, {}, {params});
  }

  createStaffUser(registration: RegistrationUserModel): Observable<any> {

    return this.http.post(`${this.url}/create/staff`, registration);
  }

}
