import { Injectable } from '@angular/core';
import { GalleryProject } from '../../model/data-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SecurityService } from '../../auth/security.service';



@Injectable()
export class GalleryProjectService {

  private companyUrl = '/api/companies';

  constructor(private http: HttpClient, private securityService: SecurityService) {
  }

  get(companyId: any, projectId: any): Observable<GalleryProject> {
    return this.http.get<GalleryProject>(`${this.companyUrl}/${companyId}/demoprojects/${projectId}`);
  }

  getAll(companyId: any): Observable<GalleryProject[]> {
    return this.http.get<GalleryProject[]>(`${this.companyUrl}/${companyId}/demoprojects`);
  }

  post(galleryProject): Observable<any> {
    return this.http.post(`${this.companyUrl}/${this.securityService.getLoginModel().company}/demoprojects`, galleryProject, {responseType: 'text'});
  }

  preSave(galleryProject): Observable<GalleryProject> {
    return this.http.post<GalleryProject>(`${this.companyUrl}/${this.securityService.getLoginModel().company}/demoprojects/presave`, galleryProject);
  }

  update(id, galleryProject): Observable<any> {
    return this.http.put(`${this.companyUrl}/${this.securityService.getLoginModel().company}/demoprojects/${id}`, galleryProject, {responseType: 'text'});
  }

  delete(id): Observable<any> {
    return this.http.delete(`${this.companyUrl}/${this.securityService.getLoginModel().company}/demoprojects/${id}`, {responseType: 'text'});
  }

  getImages(companyId, projectId) {
    return this.http.get<any>(`${this.companyUrl}/${companyId}/demoprojects/${projectId}/images`);
  }

}
