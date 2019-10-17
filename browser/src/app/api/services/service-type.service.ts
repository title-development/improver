import {Observable, ReplaySubject} from 'rxjs';
import {Injectable} from '@angular/core';
import {Pagination, ServiceType} from '../../model/data-model';
import {QuestionaryBlock} from '../../model/questionary-model';
import {HttpClient, HttpParams} from '@angular/common/http';
import {RestPage} from '../models/RestPage';
import {AdminServiceType} from '../models/AdminServiceType';

@Injectable()
export class ServiceTypeService {
  private catalogUrl = 'api/catalog';
  private serviceCatalogUrl = `${this.catalogUrl}/services`;
  private serviceTypesUrl = 'api/services';
  private _serviceTypes$: ReplaySubject<Array<ServiceType>> = new ReplaySubject<Array<ServiceType>>(1);


  private serviceTypeCached: boolean = false;



  constructor(private http: HttpClient) {
  }

  get(id: number): Observable<ServiceType> {
    return this.http.get<ServiceType>(`${this.serviceTypesUrl}/${id}`);
  }

  getAllWithQuestionary() {
    return this.http.get<Array<ServiceType>>(`${this.serviceTypesUrl}/with-questionary`);
  }

  // ==== Admin ====

  getAll(filters: any, pagination: Pagination): Observable<RestPage<AdminServiceType>> {
    // const params = toHttpParams(pagination);
    const params = {...filters, ...pagination};

    return this.http.get<RestPage<AdminServiceType>>(this.serviceTypesUrl, {params});
  }

  getServiceTypeById(id: number): Observable<AdminServiceType> {
    return this.http.get<AdminServiceType>(`${this.serviceTypesUrl}/${id}`);
  }

  updateServiceTypeById(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.serviceTypesUrl}/${id}`, formData);
  }

  createServiceType(formData: FormData): Observable<any> {
    return this.http.post(this.serviceTypesUrl, formData);
  }

  deleteServiceTypeById(id: number): Observable<any> {
    return this.http.delete(`${this.serviceTypesUrl}/${id}`);
  }

  // ==== Catalog ====

  getAllAsModel(): Observable<Array<ServiceType>> {
    return this.http.get<Array<ServiceType>>(`${this.serviceCatalogUrl}`);
  }

  getQuestionary(id: number): Observable<Array<QuestionaryBlock>> {
    return this.http.get<Array<QuestionaryBlock>>(`${this.catalogUrl}/questionary/${id}`);

  }

  getSuggested(size): Observable<Array<ServiceType>> {
    const params = new HttpParams().set('size', size);

    return this.http.get<Array<ServiceType>>(`${this.serviceCatalogUrl}/suggested`, {params});
  }

  getPopular(size): Observable<Array<ServiceType>> {
    const params = new HttpParams().set('size', size);

    return this.http.get<Array<ServiceType>>(`${this.serviceCatalogUrl}/popular`, {params});
  }

  getRecommended(userId, size: number): Observable<Array<ServiceType>> {
    const params = new HttpParams()
      .set('size', size.toString())
      .set('userId', userId.toString());

    return this.http.get<Array<ServiceType>>(`${this.serviceCatalogUrl}/recommended`, {params});
  }

  isNameFree(serviceName: string): Observable<any> {
    const params = new HttpParams()
      .set('serviceName', serviceName);

    return this.http.get(`${this.serviceTypesUrl}/isNameFree`, {
      observe: 'response',
      responseType: 'text',
      params: params
    });
  }

  get serviceTypes$(): ReplaySubject<Array<ServiceType>> {
    if (!this.serviceTypeCached) {
      this.serviceTypeCached = true;
      this.getAllAsModel().subscribe((serviceTypes: Array<ServiceType>) => {
        if (!serviceTypes){
          this.serviceTypeCached = false;
        }
        this._serviceTypes$.next(serviceTypes);
      }, err => {
        this.serviceTypeCached = false;
        console.log(err);
      });
    }

    return this._serviceTypes$;
  }



}
