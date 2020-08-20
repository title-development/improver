import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import {
  CompanyInfo,
  CompanyProfile,
  License,
  Location,
  Pagination,
  ServiceType,
  TradesAndServiceTypes
} from '../../model/data-model';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Company } from '../models/Company';
import { RestPage } from '../models/RestPage';
import { toHttpParams } from '../../util/functions';
import { CompanyAction } from '../models/CompanyAction';

import { Project } from '../models/Project';
import { RequestOrder } from '../../model/order-model';
import { ContractorNotificationSettings } from '../models/NotificationSettings';
import { CoverageConfig } from '../models/CoverageConfig';
import { CompanyCoverageConfig } from '../models/CompanyCoverageConfig';

@Injectable()
export class CompanyService {

  private companyUrl = 'api/companies';
  private profileUrl = '/profile';
  private licensesUrl = '/licenses';
  private notificationsUrl = '/config/notifications';
  private locationUrl = '/config/locations';
  private coverageUrl = '/config/coverage';
  private tradeAndServicesUrl = '/config/services';
  private areasUrl = '/config/areas';

  constructor(private http: HttpClient) {
  }

  get(id: any): Observable<CompanyInfo> {
    return this.http.get<CompanyInfo>(`${this.companyUrl}/${id}/info`);
  }

  updateInfo(id: any, companyInfo: CompanyInfo): Observable<any> {
    return this.http.put(`${this.companyUrl}/${id}/main`, companyInfo, {responseType: 'text'});
  }

  updateLocation(id: any, companyLocation: Location): Observable<any> {
    return this.http.put(`${this.companyUrl}/${id}${this.locationUrl}`, companyLocation, {responseType: 'text'});
  }

  updateCompany(companyId: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.companyUrl}/${companyId}`, formData);
  }

  getProfile(id: any): Observable<any> {
    return this.http.get(`${this.companyUrl}/${id}${this.profileUrl}`);
  }

  putProfile(id: any, companyProfile: CompanyProfile): Observable<HttpResponse<any>> {
    return this.http.put<HttpResponse<any>>(`${this.companyUrl}/${id}${this.profileUrl}`, companyProfile);
  }

  getCompanyTradesAndServiceTypes(id: any): Observable<TradesAndServiceTypes> {
    return this.http.get<TradesAndServiceTypes>(`${this.companyUrl}/${id}${this.tradeAndServicesUrl}`);
  }

  updateCompanyTradesAndServiceTypes(id: any, json: any): Observable<any> {
    return this.http.put<any>(`${this.companyUrl}/${id}${this.tradeAndServicesUrl}`, json);
  }

  getLicenses(id: any): Observable<License[]> {
    return this.http.get<any>(`${this.companyUrl}/${id}${this.licensesUrl}`);
  }

  getCompanies(filters, pagination: Pagination): Observable<RestPage<Company>> {
    const params = {...filters, ...pagination};
    return this.http.get<RestPage<Company>>(`${this.companyUrl}`, {params});
  }

  getAreas(id: any): Observable<string[]> {
    return this.http.get<string[]>(`${this.companyUrl}/${id}${this.areasUrl}`);
  }

  getCoverageConfig(companyId: string): Observable<CompanyCoverageConfig> {
    return this.http.get<CompanyCoverageConfig>(`${this.companyUrl}/${companyId}${this.coverageUrl}`);
  }

  updateCoverage(companyId: string, coverageConfig: CoverageConfig): Observable<any> {

    return this.http.put(`${this.companyUrl}/${companyId}${this.coverageUrl}`, coverageConfig);
  }

  addArea(id: any, area: string[]) {
    return this.http.post(`${this.companyUrl}/${id}${this.areasUrl}`, area);
  }

  removeArea(id: any, area: string[]) {
    let params = {
      body: area
    };
    return this.http.delete(`${this.companyUrl}/${id}${this.areasUrl}`, {params: params});
  }


  search(searchPhrase: string, zip: string, pagination: Pagination): Observable<RestPage<CompanyInfo>> {
    const params = toHttpParams(pagination)
      .set('searchPhrase', searchPhrase)
      .set('zip', zip);
    return this.http.get<RestPage<CompanyInfo>>(`${this.companyUrl}/search`, {params});
  }

  updateLogo(companyId: string, base64icon: string): Observable<any> {

    return this.http.post(`${this.companyUrl}/${companyId}/logo`, base64icon, {
      observe: 'response',
      responseType: 'text'
    });
  }

  deleteLogo(companyId: string): Observable<any> {

    return this.http.delete(`${this.companyUrl}/${companyId}/logo`);
  }

  deleteCover(companyId: string): Observable<any> {

    return this.http.delete(`${this.companyUrl}/${companyId}/cover`);
  }

  updateCover(id: string, icon: string) {
    return this.http
      .post(`${this.companyUrl}/${id}/cover`, icon, {observe: 'response', responseType: 'text'});
  }

  getCompanyLogs(companyId: string, pagination: Pagination): Observable<RestPage<CompanyAction>> {
    const params = toHttpParams(pagination);

    return this.http.get<RestPage<CompanyAction>>(`${this.companyUrl}/${companyId}/logs`, {params});
  }

  getAllProjects(companyId: string, pagination: Pagination): Observable<RestPage<Project>> {
    const params = toHttpParams(pagination);

    return this.http.get<RestPage<Project>>(`${this.companyUrl}/${companyId}/projects`, {params});
  }

  getCompanyServices(companyId: string, pagination: Pagination): Observable<RestPage<ServiceType>> {
    const params = toHttpParams(pagination);

    return this.http.get<RestPage<ServiceType>>(`${this.companyUrl}/${companyId}/services`, {params});
  }

  postOrder(order: RequestOrder, companyId: string): Observable<any> {
    const params: HttpParams = new HttpParams().set('connectOthers', 'true');

    return this.http.post(`${this.companyUrl}/${companyId}/projects`, order, {params});
  }


  isNameFree(name: string): Observable<any> {
    return this.http
      .get(`${this.companyUrl}/isNameFree?name=${name}`, {observe: 'response', responseType: 'text'});
  }

  getNotificationSettings(companyId: any): Observable<ContractorNotificationSettings> {
    return this.http.get<ContractorNotificationSettings>(`${this.companyUrl}/${companyId}${this.notificationsUrl}`);
  }

  updateNotificationSettings(companyId: any, notificationSettings: ContractorNotificationSettings) {
    return this.http.put(`${this.companyUrl}/${companyId}${this.notificationsUrl}`, notificationSettings);
  }

  deleteCompany(password: string): Observable<any> {
    return this.http.put(`${this.companyUrl}/delete`, password);
  }

  approve(companyId: string, approved: boolean): Observable<any> {
    const params = new HttpParams()
      .set('isApproved', String(approved));
    return this.http.post(`${this.companyUrl}/${companyId}/approve`, null, { params: params});
  }

  getContractors(companyId: string): Observable<any> {
    return this.http.get(`${this.companyUrl}/${companyId}/contractors`);
  }

}
