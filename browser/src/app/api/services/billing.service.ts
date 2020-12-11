import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SecurityService } from '../../auth/security.service';
import { Pagination, PaymentCard, StripeToken } from '../../model/data-model';
import { Observable } from 'rxjs';


import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LeadsReport } from '../models/LeadsReport';
import { toHttpParams } from '../../util/functions';
import { RestPage } from '../models/RestPage';
import { Billing } from "../models/Billing";
import { Role } from "../../model/security-model";
import BillingSubscription = Billing.LeadSubscription;
import Transaction = Billing.Transaction;
import Receipt = Billing.Receipt;


@Injectable()
export class BillingService {

  public billing: Billing.Info = {
    balance: 0,
    reserve: 0,
    subscriptionOn: false
  };

  private companyUrl = "api/companies";
  private cardUrl = "cards";

  onBillingUpdated: EventEmitter<any> = new EventEmitter();

  constructor(private httpClient: HttpClient,
              private router: Router,
              private securityService: SecurityService) {

    this.securityService.isUserLoggedIn.subscribe(isUserInSystem => {
      if (isUserInSystem) {
        this.initBilling();
      }
    })

  }

  initBilling () {
    if (this.securityService.hasRole(Role.CONTRACTOR)) {
      this.getBalance();
      this.getSubscriptionInfo();
    }
  }

  getBalance() {
    this.httpClient.get(`/api/companies/${this.securityService.getLoginModel().company}/balance`, {
      observe: 'response',
      responseType: 'text'
    })
      .subscribe(
        res => {
          this.billing.balance = parseInt(res.body);
        },
        err => {
          console.error(err);
        })
  }

  getSubscriptionInfo() {
    this.getSubscription(this.securityService.getLoginModel().company).subscribe(
      billingSubscription => {
        this.billing.reserve = billingSubscription.reserve;
        this.billing.subscriptionOn = billingSubscription.active;
      },
      err => {
        console.error(err);
      })
  }


  getTransactions(companyId: string, pagination: Pagination): Observable<RestPage<Transaction>> {
    const params = toHttpParams(pagination);
    return this.httpClient.get<RestPage<Transaction>>(`/api/companies/${companyId}/transactions`, {params});
  }

  getTransaction(companyId: string, transactionId: string): Observable<Receipt> {
    return this.httpClient.get<Receipt>(`/api/companies/${companyId}/transactions/${transactionId}`);
  }

  getCards(companyId: any): Observable<Array<PaymentCard>> {
    return this.httpClient
      .get<Array<PaymentCard>>(`${this.companyUrl}/${companyId}/${this.cardUrl}`)
  }

  addCard(companyId: any, stripeToken: StripeToken) {
    return this.httpClient
      .post(`${this.companyUrl}/${companyId}/${this.cardUrl}`, stripeToken, {responseType: 'text', observe: 'response'})
  }

  setDefaultCard(companyId: any, cardId: any) {
    return this.httpClient
      .post(`${this.companyUrl}/${companyId}/${this.cardUrl}/default`, cardId, {
        responseType: 'text',
        observe: 'response'
      })
  }

  deleteCard(companyId: any, cardId: any) {
    return this.httpClient
      .delete(`${this.companyUrl}/${companyId}/${this.cardUrl}/${cardId}`, {responseType: 'text', observe: 'response'})
  }

  getSubscription(companyId: any): Observable<BillingSubscription> {
    return this.httpClient.get<BillingSubscription>(`/api/companies/${companyId}/subscription`, {});
  }

  subscribe(companyId: any, budget: any): Observable<any> {
    return this.httpClient.put(`/api/companies/${companyId}/subscription`, {},
      {
        headers: new HttpHeaders({'timeZoneOffset': new Date().getTimezoneOffset().toString()}),
        params: {'budget': budget},
        responseType: 'text'
      });
  }

  cancelSubscription(companyId: any): Observable<any> {
    return this.httpClient.delete(`/api/companies/${companyId}/subscription`, {headers: new HttpHeaders({'timeZoneOffset': new Date().getTimezoneOffset().toString()})});
  }

  getLeadsReport(companyId: any): Observable<LeadsReport> {
    return this.httpClient.get<LeadsReport>(`${this.companyUrl}/${companyId}/leads/report`);
  }

  addBonus(companyId: any, amount: number): Observable<any> {
    return this.httpClient.post<any>(`${this.companyUrl}/${companyId}/bonus`, amount);
  }

}








