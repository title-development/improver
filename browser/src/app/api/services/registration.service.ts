import { Injectable } from "@angular/core";
import { CompanyRegistration, RegistrationUserModel } from '../../model/security-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";


@Injectable()
export class RegistrationService {
  private registrationUrl = 'api/register';
  private customerUrl: string = this.registrationUrl + '/customers';
  private contractorUrl: string = this.registrationUrl + '/contractors';
  private companyUrl: string = this.registrationUrl + '/companies';
  private resendEmailUrl = this.registrationUrl  + "/resend";
  private changeEmailUrl = this.registrationUrl  + "/email-change";

  constructor(private http: HttpClient) {
  }

  registerCustomer (registration :RegistrationUserModel): Observable<any> {
    return this.http.post(`${this.customerUrl}`, registration , { observe: 'response'});
  }

  registerContractor(registration: RegistrationUserModel): Observable<any> {
    return this.http
      .post(`${this.contractorUrl}`, registration, { observe: 'response', responseType: 'text' });
  }

  registerCompany(company: CompanyRegistration): Observable<any> {
    return this.http.post(`${this.companyUrl}`, company, { observe: 'response', responseType: 'text' });
  }

  resendActivationMail(userId: string, email: string = ''): Observable<any> {
    let params;
    if(userId) {
      params = new HttpParams().append('userId', userId);
    }
    if(email) {
      params = new HttpParams().append('email', email);
    }
    return this.http.post(`${this.resendEmailUrl}`, {}, {params: params, observe: 'response', responseType: 'text' })
  }

  changeActivationMail (oldNewValue: any): Observable<any> {
    return this.http.post(`${this.changeEmailUrl}`, oldNewValue, { observe: 'response', responseType: 'text'  })
  }

}
