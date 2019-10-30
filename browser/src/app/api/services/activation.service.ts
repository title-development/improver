import { Injectable } from "@angular/core";
import { ActivationCustomerModel } from '../../model/security-model';
import { Observable } from 'rxjs';
import { HttpClient } from "@angular/common/http";

@Injectable()
export class ActivationService {

  private confirmUrl = "api/confirm";
  private activationUrl = "/activation";
  private emailUrl = "/email";
  private passwordResetUrl = "/password-reset";
  private checkUrl = "/verify";

  constructor(private http: HttpClient) {
  }

  activateUser(activationCustomerModel:ActivationCustomerModel): Observable<any> {
    return this.http.post<any>(`${this.confirmUrl}${this.activationUrl}`, activationCustomerModel, {observe: 'response'})
  }

  confirmUserEmail(activationCustomerModel:ActivationCustomerModel): Observable<any> {
    return this.http.post<any>(`${this.confirmUrl}${this.emailUrl}`, activationCustomerModel, {observe: 'response'})
  }

  confirmPasswordReset(credentials, token){
    let params = {
      token: token,
      password: credentials.password
    };
    return this.http.post(`${this.confirmUrl}${this.passwordResetUrl}`, params, {observe: 'response', responseType: 'text'});
  }


  checkToken(activationCustomerModel:ActivationCustomerModel): Observable<any> {
    return this.http.get<any>(`${this.confirmUrl}${this.checkUrl}`, {params: activationCustomerModel as any})
  }

}

