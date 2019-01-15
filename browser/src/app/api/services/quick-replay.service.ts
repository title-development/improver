import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";



@Injectable()
export class QuickReplyService {
  private baseUrl = "api/pro";

  constructor(private http: HttpClient) {
  }

  getQuickReplayMessage(contractorId: any) {
    return this.http
      .get<any>(`${this.baseUrl}/${contractorId}/quickreply`)
  }

  updateQuickReplayMessage(contractorId: any, quickReplayMessage: any) {
    return this.http
      .put<any>(`api/pro/${contractorId}/quickreply`, quickReplayMessage)
  }

}
