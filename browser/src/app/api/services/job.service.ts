import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


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
