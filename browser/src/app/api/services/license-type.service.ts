import { Injectable } from '@angular/core';
import { License, LicenseType, Pagination, Review } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { RestPage } from "../models/RestPage";
import { toHttpParams } from "../../util/functions";


@Injectable()
export class LicenseTypeService {

  private licenseTypesUrl = 'api/licenseTypes';

  constructor(private http: HttpClient) {
  }

  getAll(filters: any, pagination: Pagination): Observable<RestPage<LicenseType>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<LicenseType>>(`${this.licenseTypesUrl}`, {params});
  }

  getByState(state: string): Observable<Array<LicenseType>> {
    return this.http.get<Array<LicenseType>>(`${this.licenseTypesUrl}/${state}`);
  }

  delete(id: any) {
    return this.http
      .delete(`${this.licenseTypesUrl}/${id}`);
  }

  post(licenseType: LicenseType) {
    return this.http.post(`${this.licenseTypesUrl}`, licenseType);
  }

}
