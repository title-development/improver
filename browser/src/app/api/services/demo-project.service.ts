import { Injectable } from '@angular/core';
import { DemoProject, Pagination } from '../../model/data-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecurityService } from '../../auth/security.service';
import { toHttpParams } from "../../util/functions";
import { RestPage } from "../models/RestPage";


@Injectable()
export class DemoProjectService {

  private companyUrl = '/api/companies';
  private demoProjectsUrl = '/demo-projects';

  constructor(private http: HttpClient, private securityService: SecurityService) {
  }

  get(companyId: any, projectId: any): Observable<DemoProject> {
    return this.http.get<DemoProject>(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}/${projectId}`);
  }

  getAllDemoProjects(companyId: number, pagination: Pagination): Observable<RestPage<DemoProject>> {
    const params = toHttpParams(pagination)
      .set('companyId', String(companyId));

    return this.http.get<RestPage<DemoProject>>(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}`, {params});
  }

  post(companyId: any, demoProject): Observable<DemoProject> {
    return this.http.post<DemoProject>(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}`, demoProject);
  }

  update(companyId: any, id, demoProject): Observable<DemoProject> {
    return this.http.put<DemoProject>(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}/${id}`, demoProject);
  }

  delete(companyId: any, id): Observable<any> {
    return this.http.delete(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}/${id}`, {responseType: 'text'});
  }

  getImages(companyId: any, projectId) {
    return this.http.get<any>(`${this.companyUrl}/${companyId}${this.demoProjectsUrl}/${projectId}/images`);
  }

}
