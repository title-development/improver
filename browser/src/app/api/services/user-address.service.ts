import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserAddress } from '../../model/data-model';


@Injectable()
export class UserAddressService {

  private url = 'api/users';
  private addressUrl = '/addresses'

  constructor(private http: HttpClient) {
  }

  getUserAddress(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(`${this.url}${this.addressUrl}`)
  }

}
