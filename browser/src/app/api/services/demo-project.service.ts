import { Injectable } from '@angular/core';
import { DemoProject } from '../../model/data-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecurityService } from '../../auth/security.service';


@Injectable()
export class DemoProjectService {

  private companyUrl = '/api/companies';

  constructor(private http: HttpClient, private securityService: SecurityService) {
  }

  get(companyId: any, projectId: any): Observable<DemoProject> {
    return this.http.get<DemoProject>(`${this.companyUrl}/${companyId}/profile/projects/${projectId}`);
  }

  getAll(companyId: any): Observable<DemoProject[]> {
    return this.http.get<DemoProject[]>(`${this.companyUrl}/${companyId}/profile/projects`);
  }

  post(demoProject): Observable<DemoProject> {
    return this.http.post<DemoProject>(`${this.companyUrl}/${this.securityService.getLoginModel().company}/profile/projects`, demoProject);
  }

  update(id, demoProject): Observable<DemoProject> {
    return this.http.put<DemoProject>(`${this.companyUrl}/${this.securityService.getLoginModel().company}/profile/projects/${id}`, demoProject);
  }

  delete(id): Observable<any> {
    return this.http.delete(`${this.companyUrl}/${this.securityService.getLoginModel().company}/profile/projects/${id}`, {responseType: 'text'});
  }

  getImages(companyId, projectId) {
    return this.http.get<any>(`${this.companyUrl}/${companyId}/profile/projects/${projectId}/images`);
  }

}
