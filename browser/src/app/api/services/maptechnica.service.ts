
import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";

const API_KEY : string = "q9j5YTgMrZah0gQtFUDW7rSwMJ8dlVyz0mzyDznAoXRXcwHc5xa8kOeg3WF2Jf2u";
const BASE_LINK : string = "https://api.maptechnica.com/v1";

@Injectable()
export class MapTechnicaService {

  constructor(private http: HttpClient) {
  }

  private createRequestParams(options): URLSearchParams {
    let params = new URLSearchParams();

    for(let key in options){
      params.set(key, options[key].toString());
    }

    params.set("key", API_KEY);

    options.params = params;

    return params;
  }

  search(params): Observable<any> {
    let url = BASE_LINK + "/search";
    return this.http
      .get(url, { params: params })
  }

  getZip5Bounds(params) {
    let url = BASE_LINK + "/zip5/bounds";
    return this.http
      .get(url, { params: params })
  }

  getCounty5Bounds(params) {
    let url = BASE_LINK + "/county/bounds";
    return this.http
      .get(url, { params: params })
  }

}
