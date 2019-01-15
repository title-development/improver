import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Pagination } from "../../model/data-model";
import { Observable } from "rxjs";
import { RestPage } from "../models/RestPage";
import { Invitation } from "../models/Invitation";

@Injectable()
export class InvitationService {

  invitationsUrl = 'api/invitations';

  constructor(private http: HttpClient) {
  }

  getAll(filters, pagination: Pagination): Observable<RestPage<Invitation>> {
    const params = {...filters, ...pagination};
    return this.http.get<RestPage<Invitation>>(`${this.invitationsUrl}`, {params});
  }

  post(invitation: Invitation) {
    return this.http.post<any>(`${this.invitationsUrl}`, invitation);
  }

  delete(invitationId: number) {
    return this.http.delete<any>(`${this.invitationsUrl}/${invitationId}`);
  }

  resend(invitationId: number) {
    return this.http.post<any>(`${this.invitationsUrl}/${invitationId}/resend`, {});
  }

}

