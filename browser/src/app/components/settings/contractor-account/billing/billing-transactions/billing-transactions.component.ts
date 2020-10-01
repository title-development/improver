import { Component } from '@angular/core';
import { Pagination } from '../../../../../model/data-model';
import { SecurityService } from '../../../../../auth/security.service';
import { BillingService } from '../../../../../api/services/billing.service';
import { RestPage } from '../../../../../api/models/RestPage';
import { Billing, } from "../../../../../api/models/Billing";
import Transaction = Billing.Transaction;
import TransactionType = Billing.TransactionType;

@Component({
  selector: 'billing-transactions',
  templateUrl: './billing-transactions.component.html',
  styleUrls: ['./billing-transactions.component.scss']
})

export class BillingTransactionsComponent {
  transactions: Billing.Transaction[] = [];
  transactionsPage: RestPage<Transaction> = new RestPage<Transaction>();
  TransactionType = TransactionType;
  transactionsProcessing = false;
  pagination: Pagination = new Pagination(0, 10);

  constructor(private securityService: SecurityService,
              private billingService: BillingService) {
    //this.getTransactionsReactively();
    this.getTransactions(false);
    this.billingService.onBillingUpdated.subscribe(
      () => {
        this.getTransactions(true);
      }
    )
  }

  getTransactions(refresh?: boolean) {
    this.transactionsProcessing = true;
    if (refresh)  this.pagination = new Pagination(0, 10);
    this.billingService
      .getTransactions(this.securityService.getLoginModel().company, this.pagination)
      .subscribe(
        (page: RestPage<Transaction>) => {
          this.transactionsPage = page;
          if (refresh) {
            this.transactions = [];
          }
          this.transactions.push(...page.content);
          this.pagination.nextPage();
          this.transactionsProcessing = false;
        },
        err => {
          console.error(err);
          this.transactionsProcessing = false;
        }
      );
  }

  trackByFn(index, item) {
    return item.id;
  }

}
