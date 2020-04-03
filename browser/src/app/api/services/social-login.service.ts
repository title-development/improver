import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import { SocialConnection } from '../models/SocialConnection';
import { SocialUserInfo } from '../../model/security-model';

@Injectable()
export class SocialLoginService {
  private readonly API_URL: string = '/api/socials';

  constructor(private http: HttpClient) {
  }

  getConnections(): Observable<Array<SocialConnection>> {

    return this.http.get<Array<SocialConnection>>(this.API_URL);
  }

  facebookLogin(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook`, accessToken, {observe: 'response'});
  }

  facebookRegisterCustomer(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/register/customer`, socialUserInfo, {observe: 'response'});
  }

  facebookRegisterPro(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/register/pro`, socialUserInfo, {observe: 'response'});
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

  googleRegisterPro(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/register/pro`, socialUserInfo, {observe: 'response'});
  }

  googleRegisterCustomer(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/register/customer`, socialUserInfo, {observe: 'response'});
  }

  disconnectGoogle(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/google/connect`);
  }

  connectGoogle(tokenId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/connect`, tokenId);
  }

}
