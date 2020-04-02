import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";
import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BillingService } from "../../../api/services/billing.service";
import { SecurityService } from "../../../auth/security.service";
import { getErrorMessage } from "../../../util/functions";
import { ProjectService } from "../../../api/services/project.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { Billing, } from "../../../api/models/Billing";
import TransactionType = Billing.TransactionType;
import Receipt = Billing.Receipt;

enum Mode { trans = 'trans', conn = 'conn' }

@Component({
  selector: 'invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnDestroy {
  mediaQuery: MediaQuery;
  receiptId: string;
  mode: Mode;
  transaction: Receipt;
  routeParams$: any;
  TransactionType = TransactionType;

  constructor(private route: ActivatedRoute,
              public securityService: SecurityService,
              public billingService: BillingService,
              public projectService: ProjectService,
              public  router: Router,
              public popUpService: PopUpMessageService) {
    this.routeParams$ = this.route.params.subscribe(params => {
      params['receiptId'] ? this.receiptId = params['receiptId'] : this.receiptId = '';
      params['mode'] ? this.mode = Mode[params['mode'] as string] : this.mode = null;
      this.mode == Mode.trans ? this.getByTransactionId() : this.getByProjectRequestId();
    });
  }

  ngOnDestroy(): void {
    this.routeParams$.unsubscribe();
  }

  getByTransactionId() {
    this.billingService.getTransaction(this.securityService.getLoginModel().company, this.receiptId).subscribe(
      transaction => {
        this.transaction = transaction;
      },
      err => {
        console.error(getErrorMessage(err))
      }
    );
  }

  getByProjectRequestId() {
    this.projectService.getProjectReceipt(this.receiptId).subscribe(
      transaction => {
        this.transaction = transaction;
      },
      err => {
        switch (err.status) {
          case 404: {
            this.router.navigate(['404']);
            break;
          }
          default: {
            this.popUpService.showError(getErrorMessage(err))
          }
        }
      }
    );
  }


}
