import { Injectable } from "@angular/core";
import { RegistrationContractorModel,
  RegistrationUserModel
} from '../../model/security-model';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";



@Injectable()
export class RegistrationService {
  private registrationUrl = 'api/register';
  private customerUrl: string = this.registrationUrl + '/customers';
  private contractorUrl: string = this.registrationUrl + '/contractors';
  private resendEmailUrl = this.registrationUrl  + "/resend";
  private changeEmailUrl = this.registrationUrl  + "/change";

  constructor(private http: HttpClient) {
  }

  registerCustomer (registration :RegistrationUserModel): Observable<any> {
    return this.http.post(`${this.customerUrl}`, registration , { observe: 'response', responseType: 'text' });
  }

  registerContractor(registration :RegistrationContractorModel): Observable<any> {
    return this.http
      .post(`${this.contractorUrl}`, registration, { observe: 'response', responseType: 'text' });
  }

  resendActivationMail (email: string): Observable<any> {
    return this.http.post(`${this.resendEmailUrl}`, email, {observe: 'response', responseType: 'text' })
  }

  changeActivationMail (oldNewValue: any): Observable<any> {
    return this.http.post(`${this.changeEmailUrl}`, oldNewValue, { observe: 'response', responseType: 'text'  })
  }
}
