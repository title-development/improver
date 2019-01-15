import { Injectable } from '@angular/core';
import { Customer } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';




@Injectable()
export class CustomerService {

  private customersUrl = 'api/customers';

  constructor(private http: HttpClient) {
  }

  get(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.customersUrl}/${id}`);
  }

  post(body: Object): Observable<Customer> {
    return this.http.post<Customer>(`${this.customersUrl}`, body);
  }

  put(id: number, body: Object): Observable<any> {
    return this.http.put(`${this.customersUrl}/${id}`, body);
  }

  delete(id: number): Observable<Customer> {
    return this.http.delete<Customer>(`${this.customersUrl}/${id}`);
  }

  getAll(): Observable<Array<Customer>> {
    return this.http.get<Array<Customer>>(this.customersUrl);
  }

}
