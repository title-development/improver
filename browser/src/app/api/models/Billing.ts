export class Billing {
  id: number;
  balance: number;
  subscription?: Billing.LeadSubscription;
}

export namespace Billing {
  export class LeadSubscription {
    active: boolean;
    autoContinue: boolean;
    budget: number;
    dealsCount: number;
    nextBillingDate: string;
    startBillingDate: string;
    nextBudget: number;
    reserve: number;
    spent: number;
    chargeFailureCount: number;
  }

  export class Transaction {
    id: string;
    type: TransactionType;
    details: string;
    description: string;
    created: string;
    amount: number;
    charge: boolean;
    balance: number;
    outcome: boolean;
    manualLead: boolean;
    comment: string;
  }

  export class Receipt {
    id: any;
    code: string;
    comments: string;
    customer: string;
    detail: TransactionDetails;
    invoice: boolean;
    location: Location;
    paymentMethod: string;
    projectRequestId: any;
    records : any[];
    service: string;
    totalSpend: number
  }

  export class TransactionDetails {
    type: TransactionType;
    date: string;
    description: string;
    price: number;
  }

  export enum TransactionType {
    BONUS = 'BONUS',
    TOP_UP = 'TOP_UP',
    PURCHASE = 'PURCHASE',
    RETURN = 'RETURN',
    SUBSCRIPTION = 'SUBSCRIPTION'
  }

  export class Info {
    balance: number;
    reserve: number;
    subscriptionOn: boolean
  }

}


