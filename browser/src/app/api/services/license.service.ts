import { Injectable } from '@angular/core';
import { License } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';


@Injectable()
export class LicenseService {

  private companyUrl = 'api/companies';
  private licenseUrl = 'licenses';

  constructor(private http: HttpClient) {
  }

  getCompanyLicenses(companyId: any): Observable<Array<License>> {
    return this.http.get<Array<License>>(`${this.companyUrl}/${companyId}/${this.licenseUrl}`);
  }

  updateLicense(companyId: string, license: License): Observable<any> {
    return this.http.put(`${this.companyUrl}/${companyId}/${this.licenseUrl}`, license);
  }

  postLicense(companyId: any, license: License) {
    return this.http
      .post(`${this.companyUrl}/${companyId}/${this.licenseUrl}`, license, {responseType: 'text', observe: 'response'});
  }

  getLicense(companyId: any, licenseId: any): Observable<License> {
    return this.http
      .get<License>(`${this.companyUrl}/${companyId}/${this.licenseUrl}/${licenseId}`);
  }

  deleteLicense(companyId: any, licenseId: any) {
    return this.http
      .delete(`${this.companyUrl}/${companyId}/${this.licenseUrl}/${licenseId}`);
  }

}
