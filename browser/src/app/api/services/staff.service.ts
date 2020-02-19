import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RestPage } from '../models/RestPage';
import { RegistrationUserModelBase } from '../../model/security-model';
import { StaffAction } from '../models/StaffAction';


@Injectable()
export class StaffService {

  private url = 'api/staff';

  constructor(private http: HttpClient) {
  }

  getAllActions(params, pagination): Observable<RestPage<StaffAction>> {
    params = Object.assign(params, pagination);
    return this.http.get<RestPage<StaffAction>>(`${this.url}/actions`, {params: params});
  }

  create(registration: RegistrationUserModelBase): Observable<any> {
    return this.http.post(`${this.url}`, registration);
  }

}
