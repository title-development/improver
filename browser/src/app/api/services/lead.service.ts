import { Injectable } from '@angular/core';
import { Constants } from '../../util/constants';
import { Observable } from 'rxjs';


import { HttpClient, HttpParams } from '@angular/common/http';
import { Lead, Pagination, ShortLead } from '../../model/data-model';
import { RestPage } from '../models/RestPage';
import { toHttpParams } from '../../util/functions';
import { map } from "rxjs/internal/operators";

@Injectable()
export class LeadService {
  private leadsUrl = 'api/pro/leads';

  constructor(private httpClient: HttpClient, private constants: Constants) {
    this.constants = constants;
  }

  getAll(searchTerm: string, pagination: Pagination): Observable<RestPage<ShortLead>> {
    return this.getAllInBoundingBox(searchTerm, pagination, '','')
  }

  getAllInBoundingBox(searchTerm: string, pagination: Pagination, southWest: string = '', northEast: string = ''): Observable<RestPage<ShortLead>> {
    const params = toHttpParams(pagination)
      .set('searchTerm', searchTerm ? searchTerm : '')
      .set('southWest', southWest)
      .set('northEast', northEast);

    return this.httpClient
      .get<RestPage<ShortLead>>(`${this.leadsUrl}`, {params}).pipe(
        map((leads: RestPage<ShortLead>) => {
          leads.content = leads.content.map((lead: ShortLead) => {
            return lead;
          });
          return leads;
        })
      )
  }

  get(id): Observable<Lead> {
    return this.httpClient
      .get<Lead>(`${this.leadsUrl}/${id}`);
  }

  purchase(id, fromCard): Observable<number> {
    const params = new HttpParams().set('fromCard', fromCard);
    return this.httpClient
      .post<number>(`${this.leadsUrl}/${id}/purchase`, params);
  }

  getSimilarLeads(leadId: number): Observable<Array<Lead>> {

    return this.httpClient.get<Array<Lead>>(`${this.leadsUrl}/${leadId}/similar`);
  }
}
