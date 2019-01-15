import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UnavailabilityPeriod } from '../models/UnavailabilityPeriod';
import { toHttpParams } from '../../util/functions';

@Injectable()
export class UnavailabilityPeriodService {
  private readonly companyUrl: string = '/api/companies';
  private readonly unavailabilities: string = 'unavailabilities';

  constructor(private http: HttpClient) {

  }

  getAllByCompany(companyId: string): Observable<Array<UnavailabilityPeriod>> {
    return this.http.get<Array<UnavailabilityPeriod>>(`${this.companyUrl}/${companyId}/${this.unavailabilities}`);
  }

  add(companyId: string, unavailabilityPeriod: UnavailabilityPeriod): Observable<any> {

    return this.http.post(`${this.companyUrl}/${companyId}/${this.unavailabilities}`, unavailabilityPeriod);
  }

  update(id: number, companyId: string, unavailabilityPeriod): Observable<any> {

    return this.http.put(`${this.companyUrl}/${companyId}/${this.unavailabilities}/${id}`, unavailabilityPeriod);
  }

  delete(id: number, companyId: string): Observable<any> {

    return this.http.delete(`${this.companyUrl}/${companyId}/${this.unavailabilities}/${id}`);
  }


}
