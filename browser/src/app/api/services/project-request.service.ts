import { Injectable } from '@angular/core';
import { Constants } from '../../util/constants';
import { Pagination } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { jsonParse } from '../../util/functions';
import { MessengerDocument } from '../models/MessengerDocument';


import { RestPage } from '../models/RestPage';
import { AdminProjectRequest } from '../models/AdminProjectRequest';
import { ProjectRequest } from '../models/ProjectRequest';
import { ProjectMessage } from '../models/ProjectMessage';
import { map } from "rxjs/internal/operators";
import { SecurityService } from '../../auth/security.service';

@Injectable()
export class ProjectRequestService {
  readonly projectRequestsUrl: string = 'api/project-requests';
  ProjectRequest = ProjectRequest;

  constructor(private httpClient: HttpClient, private constants: Constants, private securityService: SecurityService) {
    this.constants = constants;
  }

  getAll(filters: any, pagination: Pagination): Observable<RestPage<AdminProjectRequest>> {
    const params = {...filters, ...pagination};

    return this.httpClient.get<RestPage<AdminProjectRequest>>(this.projectRequestsUrl, {params});
  }

  getProjectRequest(id: string): Observable<any> {
    return this.httpClient.get(`${this.projectRequestsUrl}/${id}`);
  }

  hire(id: any): Observable<any> {
    return this.httpClient.post(`${this.projectRequestsUrl}/${id}/hire`, {});
  }

  getDeclineContractorVariants(id: any): Observable<any> {
    return this.httpClient.get<any>(`${this.projectRequestsUrl}/${id}/decline`);
  }

  decline(id: any, body: any): Observable<any> {
    return this.httpClient
      .post(`${this.projectRequestsUrl}/${id}/decline`, body, {responseType: 'text', observe: 'response'});
  }

  closeProject(id: any, leave: boolean) {
    return this.httpClient.post(`${this.projectRequestsUrl}/${id}/close`, {}, {params:{'leave': leave.toString()}});
  }

  sendDocuments(formData): Observable<any> {
    const req = new HttpRequest<any>('POST', `${this.projectRequestsUrl}/documents`, formData, {reportProgress: true});

    return this.httpClient.request(req);
  }

  getMessages(id: any): Observable<Array<ProjectMessage>> {
    return this.httpClient
      .get<Array<ProjectMessage>>(`${this.projectRequestsUrl}/${id}/messages`).pipe(
        map((projectMessages: Array<ProjectMessage>) => projectMessages.map((projectMessage: ProjectMessage) => {
            if (projectMessage.type == this.ProjectRequest.MessageType.DOCUMENT || projectMessage.type == this.ProjectRequest.MessageType.IMAGE) {
              projectMessage.body = typeof projectMessage.body == 'string' ? jsonParse<MessengerDocument>(projectMessage.body) : '';
            }

            return projectMessage;
          })
        )
      )

  }

}
