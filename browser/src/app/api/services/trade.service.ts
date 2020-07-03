import { Observable, ReplaySubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Pagination, ServiceType, NameIdImageTuple, Trade } from '../../model/data-model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { RestPage } from '../models/RestPage';
import { AdminTrade } from '../models/AdminTrade';


@Injectable()
export class TradeService {

  private catalogUrl = 'api/catalog';
  private tradesCatalogUrl = `${this.catalogUrl}/trades`;
  private suggestedUrl = '/suggested';
  private popularUrl = '/popular';
  private tradesUrl = 'api/trades';
  private imagesUrl = '/images';

  private _trades$: ReplaySubject<Array<Trade>> = new ReplaySubject<Array<Trade>>(1);
  private tradesCached: boolean = false;

  constructor(private http: HttpClient) {
  }

  get(id: number): Observable<Trade> {
    return this.http.get<Trade>(`${this.tradesUrl}/${id}`);
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

  updateTradeImages(id: number, data: FormData, index: string): Observable<Array<string>> {
    return this.http.put<Array<string>>(`${this.tradesUrl}/${id}${this.imagesUrl}`, data, {params: {'index': index}});
  }

  deleteTradeImage(id: number, imageUrl: string): Observable<any> {
  	return this.http.delete(`${this.tradesUrl}/${id}${this.imagesUrl}`, {params: {'imageUrl': imageUrl}})
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
    return this.http.get<ServiceType[]>(`${this.tradesCatalogUrl}/${tradeId}/services`);
  }

  getTradesWithServices(): Observable<Trade[]> {
    return this.http.get<Trade[]>(`${this.catalogUrl}`);
  }

  getPopular(size: number): Observable<Array<NameIdImageTuple>> {
    const params = new HttpParams().set('size', size.toString());

    return this.http.get<Array<NameIdImageTuple>>(`${this.tradesCatalogUrl}${this.popularUrl}`, {params});
  }

  isNameFree(tradeName: string): Observable<any> {
    const params = new HttpParams()
      .set('tradeName', tradeName);

    return this.http.get(`${this.tradesUrl}/isNameFree`, {observe: 'response', responseType: 'text', params: params});
  }

  get trades$(): ReplaySubject<Array<Trade>> {
    if (!this.tradesCached) {
      this.tradesCached = true;
      this.getAllAsModel().subscribe((serviceTypes: Array<Trade>) => {
        if (!serviceTypes){
          this.tradesCached = false;
        }
        this._trades$.next(serviceTypes);
      }, err => {
        this.tradesCached = false;
        console.error(err);
      });
    }

    return this._trades$;
  }

  getSuggested(size): Observable<Array<Trade>> {
    const params = new HttpParams().set('size', size);
    return this.http.get<Array<Trade>>(`${this.tradesCatalogUrl}${this.suggestedUrl}`, {params});
  }

  getRecommended(userId, size: number): Observable<Array<Trade>> {
    const params = new HttpParams()
      .set('size', size.toString())
      .set('userId', userId.toString());

    return this.http.get<Array<Trade>>(`${this.tradesCatalogUrl}/recommended`, {params});
  }

}
