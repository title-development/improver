import { Injectable } from '@angular/core';
import { License, Review } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Ticket } from "../models/Ticket";
import { toHttpParams } from "../../util/functions";
import { RestPage } from "../models/RestPage";



@Injectable()
export class TicketService {

  private feedbackUrl = 'api/tickets';
  private statusUrl = '/status';

  constructor(private http: HttpClient) {
  }

  getAll(filters, pagination): Observable<RestPage<Ticket>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<Ticket>>(`${this.feedbackUrl}`, {params});
  }

  post(feedback: Ticket) {
    return this.http
      .post(`${this.feedbackUrl}`, feedback, {responseType: 'text', observe: 'response'});
  }

  changeStatus(feedbackId: any, status: Ticket.Status): Observable<any> {
    return this.http
      .put(`${this.feedbackUrl}/${feedbackId}${this.statusUrl}`, status);
  }

}
