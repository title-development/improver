import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  post(ticket: any) {
    return this.http
      .post(`${this.ticketUrl}`, ticket, {responseType: 'text', observe: 'response'});
  }

  changeStatus(ticketId: any, status: Ticket.Status): Observable<any> {
    return this.http
      .patch(`${this.ticketUrl}/${ticketId}${this.statusUrl}`, status);
  }

  update(ticket: Ticket): Observable<any> {
    return this.http
      .put(`${this.ticketUrl}/${ticket.id}`, ticket);
  }

  createByStaff(ticket: Ticket): Observable<any> {
    return this.http
      .post(`${this.ticketUrl}/staff`, ticket);
  }

  updateCompanyName(name: string): Observable<any> {
    return this.http.put(`${this.ticketUrl}/company/name`, name);
  }

  updateCompanyFoundationYear(founded: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };
    return this.http.put(`${this.ticketUrl}/company/founded`, founded, httpOptions);
  }

}
