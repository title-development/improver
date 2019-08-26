import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';

import { ZipBoundaries } from '../models/ZipBoundaries';
import { HttpClient, HttpParams } from '@angular/common/http';
import { chunk } from '../../util/functions';
import { catchError, mergeMap, retry } from 'rxjs/operators';

@Injectable()
export class BoundariesService {

  geoUrl = 'api/geo';
  zipsUrl = '/zips';
  boundariesUrl = '/boundaries';
  searchUrl = '/search';
  bboxUrl = '/bbox';
  radiusUrl = '/radius';
  coverageUrl = '/coverage';

  constructor(private http: HttpClient) {
  }

  getAllServedZips(): Observable<Array<string>> {
    return this.http.get<Array<string>>(`${this.geoUrl}${this.coverageUrl}${this.zipsUrl}`);
  }

  updateServedZips(zips: Array<string>): Observable<any> {

    return this.http.put(`${this.geoUrl}${this.coverageUrl}${this.zipsUrl}`, zips);
  }

  getUnsupportedArea(): Observable<ZipBoundaries> {
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.coverageUrl}/json`);
  }

  isZipSupported(zip): Observable<boolean> {
    return this.http.get<boolean>(`${this.geoUrl}${this.coverageUrl}/isZipSupported`, {params: {zip: zip}});
  }

  getSplitZipBoundaries(zips: ReadonlyArray<string>, splitSize: number | null = null): Observable<ZipBoundaries> {
    if(splitSize) {
      const splicedZips = chunk<string>(zips, splitSize);
      return from(splicedZips)
        .pipe(
          mergeMap(chunk => this.getZipBoundaries(chunk), splicedZips.length),
          retry(2)
        )
    }
    return this.getZipBoundaries(zips);
  }

  getZipCodesInBbox(nw, sw): Observable<ZipBoundaries> {
    const params = {
      southWest: sw,
      northEast: nw
    };
    return this.http.get<ZipBoundaries>(`${this.geoUrl}${this.zipsUrl}${this.searchUrl}${this.bboxUrl}${this.boundariesUrl}`, {params: params});
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
    )
  }
}
