import { Injectable } from "@angular/core";

@Injectable()
export class SubscriptionActionsService {

  public subscriptionAmount = 0;
  public nextBillingDate = new Date().toISOString();

  constructor() {

  }

  public reset() {
    this.subscriptionAmount = 0;
    this.nextBillingDate = new Date().toISOString();
  }


}
