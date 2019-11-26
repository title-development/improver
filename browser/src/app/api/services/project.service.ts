import { Injectable } from '@angular/core';
import { Constants } from '../../util/constants';
import { SecurityService } from '../../auth/security.service';
import { Role } from '../../model/security-model';
import {
  CloseProjectVariant,
  ContractorProject,
  ContractorProjectShort,
  CustomerProject,
  CustomerProjectShort,
  Pagination
} from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { RestPage } from '../models/RestPage';
import { Project } from '../models/Project';


import { RequestOrder } from '../../model/order-model';
import { toHttpParams } from '../../util/functions';
import { Billing } from '../models/Billing';
import { Refund } from '../models/Refund';
import { map } from 'rxjs/internal/operators';
import Receipt = Billing.Receipt;

@Injectable()
export class ProjectService {
  readonly API = '/api';
  readonly PROJECTS = '/projects';
  readonly PRO = this.API + '/pro';
  readonly CUSTOMERS = this.API + '/customers';
  readonly CUSTOMER_PROJECTS_PATH = this.CUSTOMERS + this.PROJECTS;
  readonly PROJECTS_PATH = this.API + this.PROJECTS;
  readonly LOCATION = '/location';
  readonly RECEIPT = '/receipt';
  readonly REFUND = '/refund';

  constructor(private http: HttpClient,
              private constants: Constants,
              private securityService: SecurityService) {
    this.constants = constants;
  }

  //todo this is ugly rework
  private getBaseUrl(): string {
    if (this.securityService.isAuthenticated()) {
      let prefix;
      if (this.securityService.getRole() == Role.CUSTOMER) {
        prefix = this.CUSTOMERS;
      } else if (this.securityService.getRole() == Role.CONTRACTOR) {
        prefix = this.PRO;
      } else {
        this.securityService.logout();
      }
      return prefix + this.PROJECTS;
    }
    this.securityService.logout();
  }

  getAll(params, pagination): Observable<RestPage<Project>> {
    params = Object.assign(params, ...pagination);

    return this.http.get<RestPage<Project>>(`${this.API}${this.PROJECTS}`, {params: params});
  }

  getProject(id): Observable<any> {
    return this.http.get(`${this.API}${this.PROJECTS}/${id}`);
  }

  getForCustomer(id: number): Observable<CustomerProject> {
    return this.http
      .get<CustomerProject>(`${this.getBaseUrl()}/${id}`).pipe(
        map(res => myRemapper(CustomerProject, res))
      );
  }

  getForContractor(projectRequestId: string): Observable<ContractorProject> {
    return this.http
      .get<ContractorProject>(`${this.getBaseUrl()}/${projectRequestId}`);
  }

  getProjectReceipt(id: string): Observable<Receipt> {
    return this.http
      .get<Receipt>(`${this.getBaseUrl()}/${id}${this.RECEIPT}`);
  }

  getRefundOptions(id: string): Observable<Refund.Questionary> {
    return this.http
      .get<Refund.Questionary>(`${this.getBaseUrl()}/${id}${this.REFUND}/options`);
  }

  requestRefund(id: string, refundRequest: Refund.Request): Observable<any> {
    return this.http
      .post<any>(`${this.getBaseUrl()}/${id}${this.REFUND}`, refundRequest);
  }

  getRefundResult(id: string): Observable<Refund.Result> {
    return this.http
      .get<Refund.Result>(`${this.getBaseUrl()}/${id}${this.REFUND}`);
  }

  getAllForCustomer(active: boolean, pagination: Pagination): Observable<RestPage<CustomerProjectShort>> {
    const params = toHttpParams(pagination)
      .set('active', active.toString());
    return this.http.get<RestPage<CustomerProjectShort>>(this.getBaseUrl(), {params});
  }

  getAllForContractor(latest: boolean, search: string, pagination: Pagination): Observable<RestPage<ContractorProjectShort>> {
    const params = toHttpParams({...pagination, ...{latest: latest, search: search}});
    return this.http.get<RestPage<ContractorProjectShort>>(this.getBaseUrl(), {params});
  }

  getProjectsCount(latest: boolean): Observable<number> {
    let params = new HttpParams();
    params = params.append('latest', latest.toString());
    return this.http
      .head<number>(this.getBaseUrl(), {params: params, observe: 'response'}).pipe(
        map((res: HttpResponse<any>) => Number(res.headers.get(this.constants.headerCountPropName)))
      );

  }

  postOrder(order: RequestOrder): Observable<any> {
    return this.http.post(`${this.PROJECTS_PATH}`, order);
  }

  postUnsavedProjects(project: RequestOrder): Observable<any> {
    return this.http
      .post(`${this.PROJECTS_PATH}`, project);
  }

  getCloseProjectVariants(projectId): Observable<CloseProjectVariant> {
    return this.http
      .get<CloseProjectVariant>(`${this.CUSTOMER_PROJECTS_PATH}/${projectId}/close`);
  }

  closeProject(projectId, body): Observable<any> {
    return this.http
      .post(`${this.CUSTOMER_PROJECTS_PATH}/${projectId}/close`, body);
  }

  getCloseProjectVariantsBySupport(projectId): Observable<CloseProjectVariant> {
    return this.http
      .get<CloseProjectVariant>(`${this.PROJECTS_PATH}/${projectId}/close`);
  }

  closeProjectBySupport(projectId, body): Observable<any> {
    return this.http
      .post(`${this.PROJECTS_PATH}/${projectId}/close`, body);
  }

  uploadImage(projectId, formData: FormData) {
    return this.http.post(`${this.PROJECTS_PATH}/${projectId}/images`, formData);
  }

  deleteImage(projectId, path: string): Observable<any> {
    return this.http.delete(`${this.PROJECTS_PATH}/${projectId}/images`, {
      params: {'imageUrl': path},
      responseType: 'text'
    });
  }

  getProjectImages(projectId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.PROJECTS_PATH}/${projectId}/images`);
  }

  updateLocation(projectId: number, location) {
    return this.http.put(`${this.PROJECTS_PATH}/${projectId}${this.LOCATION}`, location);
  }


  validation(projectId: number, validation: Project.ValidationRequest) {
    return this.http.put(`${this.PROJECTS_PATH}/${projectId}/validation`, validation);
  }

  addComment(projectId: number, comment: string) {
    return this.http.put(`${this.PROJECTS_PATH}/${projectId}/comment`, comment);
  }
}

export function myRemapper<T>(c: new () => T, data: any): T {
  return Object.assign(new c(), data);
}
