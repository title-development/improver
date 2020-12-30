import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Pagination } from '../../model/data-model';
import { Observable } from 'rxjs/internal/Observable';
import { toHttpParams } from '../../util/functions';
import { Refund } from '../models/Refund';
import { RestPage } from '../models/RestPage';
import { RefundAction } from '../models/RefundAction';
import { SecurityService } from "../../auth/security.service";
import { HttpParamsEncoder } from "../../util/http-param-encoder";

@Injectable()
export class RefundService {
  private url: string = 'api/refund';

  constructor(private http: HttpClient,
              private encoder: HttpParamsEncoder) {
  }

  getAll(params: any, pagination: Pagination): Observable<RestPage<Refund>> {
    params = new HttpParams({ fromObject: {...params, ...pagination}, encoder: this.encoder });
    return this.http.get<RestPage<Refund>>(this.url, {params});
  }

  getFullRefund(refundId: number): Observable<Refund> {

    return this.http.get<Refund>(`${this.url}/${refundId}`);
  }

  getRefundActions(refundId: number): Observable<Array<RefundAction>> {

    return this.http.get<Array<RefundAction>>(`${this.url}/${refundId}/actions`);
  }

  actions(refundId: number, action: RefundAction.Action, comment: string): Observable<any> {
    const params = new HttpParams()
      .set('action', action);

    return this.http.post(`${this.url}/${refundId}/actions`, comment,{params});
  }
}
