import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import { PhoneValidationConfirm } from "../models/PhoneValidationConfirm";


@Injectable()
export class PhoneService {

  private url = 'api/phone';

  constructor(private http: HttpClient) {
  }

  numberValidationRequest(phone: string): Observable<any> {
    return this.http.post(`${this.url}/validation/request`, phone, {observe: 'response', responseType: 'text'});
  }

  numberValidationConfirm(phoneValidationConfirm: PhoneValidationConfirm): Observable<any> {
    return this.http.post(`${this.url}/validation/confirm`, phoneValidationConfirm);
  }

}
