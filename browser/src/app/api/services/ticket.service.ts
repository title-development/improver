import { Injectable } from '@angular/core';
import { License, Review } from '../../model/data-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { toHttpParams } from "../../util/functions";
import { RestPage } from "../models/RestPage";
import { Ticket } from "../models/Ticket";



@Injectable()
export class TicketService {

  private ticketUrl = 'api/tickets';
  private statusUrl = '/status';

  constructor(private http: HttpClient) {
  }

  getAll(filters, pagination): Observable<RestPage<Ticket>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<Ticket>>(`${this.ticketUrl}`, {params});
  }

  getMy(filters, pagination): Observable<RestPage<Ticket>> {
    const params = toHttpParams({...filters, ...pagination});
    return this.http.get<RestPage<Ticket>>(`${this.ticketUrl}/my`, {params});
  }

  post(ticketId: any) {
    return this.http
      .post(`${this.ticketUrl}`, ticketId, {responseType: 'text', observe: 'response'});
  }

  changeStatus(ticketId: any, status: Ticket.Status): Observable<any> {
    return this.http
      .patch(`${this.ticketUrl}/${ticketId}${this.statusUrl}`, status);
  }

  update(ticket: Ticket): Observable<any> {
    return this.http
      .put(`${this.ticketUrl}/${ticket.id}`, ticket);
  }

}
