import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { SocialConnection } from '../models/SocialConnection';
import { SocialConnectionConfig } from '../../model/security-model';

@Injectable()
export class SocialLoginService {
  private readonly API_URL: string = '/api/socials';

  constructor(private http: HttpClient) {
  }

  getConnections(): Observable<Array<SocialConnection>> {

    return this.http.get<Array<SocialConnection>>(this.API_URL);
  }

  facebookLogin(accessToken: string): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.API_URL}/facebook`, accessToken, {observe: 'response'});
  }

  facebookRegisterCustomer(socialConnectionConfig: SocialConnectionConfig): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/register/customer`, socialConnectionConfig, {observe: 'response'});
  }

  facebookRegisterPro(socialConnectionConfig: SocialConnectionConfig): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/register/pro`, socialConnectionConfig, {observe: 'response'});
  }

  disconnectFacebook(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/facebook/connect`);
  }

  connectFacebook(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/connect`, accessToken);
  }

  googleLogin(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google`, accessToken, {observe: 'response'});
  }

  googleRegisterPro(socialConnectionConfig: SocialConnectionConfig): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/register/pro`, socialConnectionConfig, {observe: 'response'});
  }

  googleRegisterCustomer(socialConnectionConfig: SocialConnectionConfig): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/register/customer`, socialConnectionConfig, {observe: 'response'});
  }

  disconnectGoogle(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/google/connect`);
  }

  connectGoogle(tokenId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/connect`, tokenId);
  }

}
