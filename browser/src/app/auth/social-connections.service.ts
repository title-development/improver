import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import { SocialConnection } from '../api/models/SocialConnection';
import { SocialUserInfo } from '../model/security-model';

@Injectable()
export class SocialConnectionsService {
  private readonly API_URL: string = '/api/socials';

  constructor(private http: HttpClient,) {

  }

  getConnections(): Observable<Array<SocialConnection>> {

    return this.http.get<Array<SocialConnection>>(this.API_URL);
  }

  facebookApiLogin(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook`, socialUserInfo, {observe: 'response'});
  }

  proFacebookApiRegister(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/pro`, socialUserInfo, {observe: 'response'});
  }

  disconnectFacebook(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/facebook`);
  }

  connectFacebook(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/connect`, accessToken);
  }

  googleApiLogin(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google`, socialUserInfo, {observe: 'response'});
  }

  proGoogleApiRegister(socialUserInfo: SocialUserInfo): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/pro`, socialUserInfo, {observe: 'response'});
  }

  disconnectGoogle(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/google`);
  }

  connectGoogle(tokenId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/connect`, tokenId);
  }


}
