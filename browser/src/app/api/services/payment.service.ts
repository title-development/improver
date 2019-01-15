import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StripeToken } from "../../model/data-model";

@Injectable()
export class PaymentService {

  private companyUrl = "api/companies";
  private paymentsUrl = "payments";

  constructor(private http: HttpClient) {
  }

  charge(companyId: any, amount: number) {
    return this.http.post(`${this.companyUrl}/${companyId}/${this.paymentsUrl}`, amount, {responseType: 'text', observe: 'response'})
  }

}
