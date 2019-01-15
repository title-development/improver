
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { OfferedServiceType, Pagination, ServiceType, Trade } from '../../model/data-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestPage } from '../models/RestPage';
import { AdminTrade } from '../models/AdminTrade';
import { first, publishReplay, refCount } from "rxjs/internal/operators";


@Injectable()
export class TradeService {

  private catalogUrl = 'api/catalog';
  private tradesCatalogUrl = `${this.catalogUrl}/trades`;
  private tradesUrl = 'api/trades';

  private _popular$: Observable<Array<ServiceType>>;
  private _trades$: Observable<Array<ServiceType>>;

  constructor(private http: HttpClient) {
  }

  get(id: number): Observable<Trade> {
    return this.http.get<Trade>(`${this.tradesUrl}/${id}`)
  }

  // =============== Admin ====================

  getAll(filters: any, pagination: Pagination): Observable<RestPage<AdminTrade>> {
    const params = {...filters, ...pagination};

    return this.http.get<RestPage<AdminTrade>>(this.tradesUrl, {params});
  }

  getTradeById(id: number): Observable<AdminTrade> {
    return this.http.get<AdminTrade>(`${this.tradesUrl}/${id}`);
  }

  updateTradeById(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.tradesUrl}/${id}`, formData);
  }

  createTrade(formData: FormData): Observable<any> {
    return this.http.post(this.tradesUrl, formData);
  }

  deleteTradeById(id: number): Observable<any> {
    return this.http.delete(`${this.tradesUrl}/${id}`);
  }

  // =============== Catalog ====================
  getAllAsModel(): Observable<Array<Trade>> {
    return this.http.get<Array<Trade>>(`${this.tradesCatalogUrl}`);
  }

  getServiceTypes(tradeId: number): Observable<ServiceType[]> {
    return this.http.get<ServiceType[]>(`${this.tradesCatalogUrl}/${tradeId}/services`)
  }

  getTradesWithServices(): Observable<Trade[]> {
    return this.http.get<Trade[]>(`${this.catalogUrl}`);
  }

  getPopular(size: number): Observable<Array<Trade>> {
    const params = new HttpParams().set('size', size.toString());

    return this.http.get<Array<Trade>>(`${this.tradesCatalogUrl}/popular`, {params});
  }

  isNameFree(tradeName: string): Observable<any> {
    const params = new HttpParams()
        .set('tradeName', tradeName);

    return this.http.get(`${this.tradesUrl}/isNameFree`, { observe: 'response', responseType: 'text', params: params })
  }

  get trades$(): Observable<Array<Trade>> {
    if (!this._trades$) {
      this._trades$ = this.getAllAsModel().pipe(publishReplay(1), refCount(), first());
    }

    return this._trades$;
  }

  get popular$(): Observable<Array<Trade>> {
    if (!this._popular$) {
      this._popular$ = this.getPopular(16).pipe(publishReplay(1), refCount(), first());
    }

    return this._popular$;
  }
}
