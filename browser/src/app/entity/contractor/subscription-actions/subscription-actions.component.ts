import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { addPaymentCardDialogConfig } from "../../../shared/dialogs/dialogs.configs";
import { dialogsMap } from "../../../shared/dialogs/dialogs.state";
import { PaymentCard} from "../../../model/data-model";
import { MatDialog, MatDialogRef } from "@angular/material";
import { SecurityService } from "../../../auth/security.service";
import { BillingService } from "../../../api/services/billing.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { TricksService } from "../../../util/tricks.service";
import { SubscriptionActionsService } from "./subscription-actions.service";
import { getErrorMessage } from "../../../util/functions";

enum ModeEnum {NEW = 'NEW', UPDATE = 'UPDATE', CANCEL = 'CANCEL'}

@Component({
  selector: 'subscription-actions-page',
  templateUrl: './subscription-actions.component.html',
  styleUrls: ['./subscription-actions.component.scss']
})

export class SubscriptionActionsComponent implements OnInit {

  ModeEnum = ModeEnum;
  mode: ModeEnum;
  sub: any;
  cardProcessing = true;
  subscriptionProcessing = false;

  paymentCards: Array<PaymentCard>;
  updateCreditCardDialogRef: MatDialogRef<any>;

  constructor(public router: Router,
              public tricksService: TricksService,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public billingService: BillingService,
              public subscriptionActionsService: SubscriptionActionsService,
              public popupService: PopUpMessageService,
              public route: ActivatedRoute) {
    this.sub = this.route.params.subscribe(params => {
      params['mode'] ? this.mode = params['mode'].toString().toUpperCase() : this.mode = null;

      if (this.mode != ModeEnum.NEW && this.mode != ModeEnum.UPDATE && this.mode != ModeEnum.CANCEL ||
        subscriptionActionsService.subscriptionAmount <= 0 && this.mode != ModeEnum.CANCEL ||
        subscriptionActionsService.nextBillingDate == null && this.mode === ModeEnum.CANCEL) {
        this.router.navigate(['/pro/settings/billing'])
      }

      this.getPaymentCards();

    });

  }

  ngOnInit(): void {
  }

  openChangeDefaultPaymentCard() {
    this.dialog.closeAll();
    this.updateCreditCardDialogRef = this.dialog.open(dialogsMap['change-default-payment-card-dialog'], addPaymentCardDialogConfig);
    this.updateCreditCardDialogRef
      .afterClosed()
      .subscribe(result => {
        this.updateCreditCardDialogRef = null;
      });
    this.updateCreditCardDialogRef.componentInstance.onPaymentCardSelect.subscribe((card: any) => {
      this.getPaymentCards();
    });
  }

  getPaymentCards() {
    this.cardProcessing = true;
    this.billingService.getCards(this.securityService.getLoginModel().company)
      .subscribe(
        cards => {
          this.paymentCards = cards;
          this.cardProcessing = false;
        },
        err => {
          console.log(err);
          this.popupService.showError(getErrorMessage(err));
          this.cardProcessing = false;
        }
      );
  }

  confirmSubscription() {
    this.subscriptionProcessing = true;
    this.billingService.subscribe(this.securityService.getLoginModel().company, this.subscriptionActionsService.subscriptionAmount).subscribe(
      response => {
        this.subscriptionProcessing = false;
        if (this.mode == this.ModeEnum.UPDATE) {
          this.popupService.showSuccess(`You have been updated next subscription to $${this.subscriptionActionsService.subscriptionAmount / 100}/month`);
        } else {
          this.popupService.showSuccess(`You have been subscribed for $${this.subscriptionActionsService.subscriptionAmount / 100}/month`);
        }
        this.subscriptionActionsService.reset();
        this.router.navigate(['/pro/settings/billing'])
      },
      err => {
        console.log(err);
        this.popupService.showError(getErrorMessage(err));
        this.subscriptionProcessing = false;
      }
    )
  }

  unsubscribe(): void {
    this.subscriptionProcessing = true;
    this.billingService.cancelSubscription(this.securityService.getLoginModel().company).subscribe(
      response => {
        this.popupService.showInfo('You have been canceled your subscription for leads');
        this.subscriptionActionsService.reset();
        this.router.navigate(['/pro/settings/billing'])
      },
      err => {
        console.log(err);
        this.popupService.showError(getErrorMessage(err));
        this.subscriptionProcessing = false;
      }
    )
  }

  openAddPaymentCard() {
    this.dialog.closeAll();
    this.updateCreditCardDialogRef = this.dialog.open(dialogsMap['add-payment-card-dialog'], addPaymentCardDialogConfig);
    this.updateCreditCardDialogRef
      .afterClosed()
      .subscribe(result => {
        this.updateCreditCardDialogRef = null;
      });
    this.updateCreditCardDialogRef.componentInstance.onPaymentCardAdd.subscribe((card: any) => {
      this.getPaymentCards();
    });
  }

}
