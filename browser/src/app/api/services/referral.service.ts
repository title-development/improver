import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable()
export class ReferralService {
  private readonly url: string = '/api/referral';

  constructor(private http:HttpClient) {

  }

  getReferralCode(): Observable<any> {

    return this.http.get(`${this.url}`, {responseType: 'text'});
  }
}
