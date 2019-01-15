import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ValidatedLocation } from '../models/LocationsValidation';
import {toHttpParams} from "../../util/functions";


@Injectable()
export class LocationValidateService {

  private locationUrl = 'api/locations';
  private validationUrl = 'validation';

  constructor(private http: HttpClient) {
  }

  validate(request): Observable<ValidatedLocation> {
    return this.http.get<ValidatedLocation>(`${this.locationUrl}/${this.validationUrl}`, {params: request});
  }

  validateWithCoverage(location): Observable<ValidatedLocation> {
    let locationValidationRequest = {
      streetAddress: location.streetAddress,
      city: location.city,
      zip: location.zip,
      state: location.state,
      coordinates: false,
      checkCoverage: true
    };
    return this.http.get<ValidatedLocation>(`${this.locationUrl}/${this.validationUrl}`, {params: toHttpParams(locationValidationRequest)});
  }
}
