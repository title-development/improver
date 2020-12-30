import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestPage } from '../models/RestPage';
import { RegistrationUserModelBase } from '../../model/security-model';
import { StaffAction } from '../models/StaffAction';
import { HttpParamsEncoder } from "../../util/http-param-encoder";


@Injectable()
export class StaffService {

  private url = 'api/staff';

  constructor(private http: HttpClient,
              private encoder: HttpParamsEncoder) {
  }

  getAllActions(params, pagination): Observable<RestPage<StaffAction>> {
    params = new HttpParams({ fromObject: {...params, ...pagination}, encoder: this.encoder });
    return this.http.get<RestPage<StaffAction>>(`${this.url}/actions`, {params: params});
  }

  create(registration: RegistrationUserModelBase): Observable<any> {
    return this.http.post(`${this.url}`, registration);
  }

}
