import { Injectable } from '@angular/core';
import { asyncScheduler, from, Observable, of, throwError } from 'rxjs';

import { ZipBoundaries } from '../models/ZipBoundaries';
import { HttpClient, HttpParams } from '@angular/common/http';
import { chunk, getErrorMessage } from '../../util/functions';
import { catchError, mergeMap, retry } from 'rxjs/operators';
import { CountyBoundaries } from "../models/CountyBoundaries";

@Injectable()
export class BoundariesService {

  geoUrl = 'api/geo';
  zipsUrl = '/zips';
  countiesUrl = '/counties';
  boundariesUrl = '/boundaries';
  searchUrl = '/search';
  bboxUrl = '/bbox';
  radiusUrl = '/radius';
  coverageUrl = '/coverage';
  unsupportedUrl = '/unsupported';

  constructor(private http: HttpClient) {
  }

  getAllServedZips(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.geoUrl}${this.coverageUrl}${this.zipsUrl}`);
  }

  getAllServedCounties(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.geoUrl}${this.coverageUrl}${this.countiesUrl}`);
  }

  updateServedZips(zips: Array<string>): Observable<any> {
    return this.http.put(`${this.geoUrl}${this.coverageUrl}${this.zipsUrl}`, zips);
  }

  updateServedCounties(added: Array<string>, removed: Array<string>): Observable<any> {
    return this.http.put(`${this.geoUrl}${this.coverageUrl}${this.countiesUrl}`, {added: added, removed: removed});
  }

  getUnsupportedArea(): Observable<ZipBoundaries> {
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.unsupportedUrl}`);
  }

  getCoverageArea(): Observable<ZipBoundaries> {
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.coverageUrl}`);
  }

  isZipSupported(zip): Observable<boolean> {
    return this.http.get<boolean>(`${this.geoUrl}${this.coverageUrl}/isZipSupported`, {params: {zip: zip}});
  }

  getSplitZipBoundaries(zips: ReadonlyArray<string>, splitSize: number | null = null): Observable<ZipBoundaries> {
    if (splitSize) {
      const splicedZips = chunk<string>(zips, splitSize);
      return from(splicedZips, asyncScheduler)
        .pipe(
          mergeMap(ch => this.getZipBoundaries(ch), splicedZips.length),
          retry(2)
        );
    }
    return this.getZipBoundaries(zips);
  }

  getZipCodesInBbox(nw, sw): Observable<ZipBoundaries> {
    const params = {
      southWest: sw,
      northEast: nw
    };
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.zipsUrl}${this.searchUrl}${this.bboxUrl}${this.boundariesUrl}`, {params: params})
      .pipe(catchError(err => {
        console.error(getErrorMessage(err));
        return throwError(err);
      }));
  }

  getCountiesInBbox(nw, sw): Observable<CountyBoundaries> {
    const params = {
      southWest: sw,
      northEast: nw
    };
    return this.http.get<CountyBoundaries>(`${this.geoUrl}${this.countiesUrl}${this.searchUrl}${this.bboxUrl}${this.boundariesUrl}`, {params: params})
      .pipe(catchError(err => {
        console.error(getErrorMessage(err));
        return throwError(err);
      }));
  }

  queryByRadius(latitude, longitude, radius): Observable<ZipBoundaries> {
    const params = new HttpParams()
      .set('latitude', latitude)
      .set('longitude', longitude)
      .set('radius', radius);

    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.zipsUrl}${this.searchUrl}${this.radiusUrl}${this.boundariesUrl}`, {params});
  }

  getZipBoundaries(zipCodes: ReadonlyArray<string>): Observable<ZipBoundaries> {
    const params = {
      zipCodes: zipCodes.join()
    };
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.zipsUrl}${this.boundariesUrl}`, {params: params});
  }

  private getZipBoundariesChunk(zips: string[]): Observable<ZipBoundaries | null> {
    return this.getZipBoundaries(zips).pipe(
      retry(2),
      catchError(err => of(null))
    );
  }

  getCountyBoundaries(counties: ReadonlyArray<string>): Observable<CountyBoundaries> {
    const params = {
      counties: counties.join()
    };
    return this.http.get<CountyBoundaries>(`${this.geoUrl}${this.countiesUrl}${this.boundariesUrl}`, {params: params});
  }

}
