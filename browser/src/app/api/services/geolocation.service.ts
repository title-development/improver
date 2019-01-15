
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Geolocation } from '../../model/data-model';


import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class GeolocationService {

  private geoLocationUrl = 'api/geolocation';
  private geocodeAPIUrl = 'https://maps.googleapis.com/maps/api/geocode/';
  public geolocation: Geolocation;

  constructor(private http: HttpClient) {
    this.initGeolocation();
  }

  get(): Observable<Geolocation> {
    return this.http.get<Geolocation>(`${this.geoLocationUrl}`)
  }

  getByIp(ip: string): Observable<Geolocation> {
    return this.http.get<Geolocation>(`${this.geoLocationUrl}/${ip}`)
  }

  initGeolocation() {
    if (!sessionStorage.getItem('geolocation')) {
      this.get().subscribe(
        geolocation => {
          this.setGeolocation(JSON.stringify(geolocation));
        },
        err => {
          console.log(err);
        });
    } else {
      this.setGeolocation(sessionStorage.getItem('geolocation'));
    }

  }

  getGeolocation() {
    return this.geolocation;
  }

  setGeolocation(geolocation: string) {
    sessionStorage.setItem('geolocation', geolocation);
    this.geolocation = JSON.parse(geolocation);
  }

  geocodeLocation(location) {
    let locationString =
      `${location.state || ''} ` +
      `${location.city || ''} ` +
      `${location.streetAddress || ''} ` +
      `${location.zip || ''}`;
    let url = `${this.geocodeAPIUrl}json?address=${locationString}+usa`;
    return this.http
      .get(url, {headers: {}}) //empty options to avoid CORS error
  }
}
