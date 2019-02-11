import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient, HttpParams } from '@angular/common/http';
import { SocialConnection } from '../api/models/SocialConnection';

@Injectable()
export class SocialConnectionsService {
  private readonly API_URL: string = '/api/socials';

  constructor(private http: HttpClient,) {

  }

  getConnections(): Observable<Array<SocialConnection>> {

    return this.http.get<Array<SocialConnection>>(this.API_URL);
  }

  facebookApiLogin(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook`, accessToken, {observe: 'response'});
  }

  proFacebookRegister(data): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/pro`, data, {observe: 'response'});
  }

  disconnectFacebook(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/facebook`);
  }

  connectFacebook(accessToken: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/facebook/connect`, accessToken);
  }

  googleApiLogin(tokenId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google`, tokenId, {observe: 'response'});
  }

  proGoogleApiRegister(data): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/pro`, data, {observe: 'response'});
  }

  disconnectGoogle(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/google`);
  }

  connectGoogle(tokenId: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/google/connect`, tokenId);
  }


}
