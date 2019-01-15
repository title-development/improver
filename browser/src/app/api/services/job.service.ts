import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { RestPage } from '../models/RestPage';
import { ContractorNotificationSettings, CustomerNotificationSettings } from '../models/NotificationSettings';
import { Pagination } from '../../model/data-model';
import { AdminContractor } from '../models/AdminContractor';
import { RegistrationUserModel } from '../../model/security-model';


@Injectable()
export class JobService {

  private url = 'api/jobs';

  constructor(private http: HttpClient) {
  }

  runUpdateSubscriptionJob(): Observable<any> {
    return this.http
      .post(`${this.url}/updateSubscription`, null);
  }

  runPublishReviewJob(): Observable<any> {
    return this.http
      .post(`${this.url}/publishReview`, null);
  }

}
