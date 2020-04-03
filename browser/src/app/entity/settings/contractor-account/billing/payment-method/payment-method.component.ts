import { Component, OnInit } from '@angular/core';
import { PaymentCard } from '../../../../../model/data-model';
import { Constants } from '../../../../../util/constants';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  addMoneyDialogConfig,
  addPaymentCardDialogConfig,
  confirmDialogConfig
} from '../../../../../shared/dialogs/dialogs.configs';
import { SecurityService } from '../../../../../auth/security.service';
import { BillingService } from '../../../../../api/services/billing.service';
import { TricksService } from '../../../../../util/tricks.service';
import { dialogsMap } from '../../../../../shared/dialogs/dialogs.state';

@Component({
  selector: 'payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss']
})

export class PaymentMethodComponent implements OnInit {
  cards: Array<PaymentCard> = [];
  updateCreditCardDialogRef: MatDialogRef<any>;
  addMoneyDialogRef: MatDialogRef<any>;
  confirmDialogRef: MatDialogRef<any>;

  paymentCardsProcessing = true;

  constructor(public constants: Constants,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public billingService: BillingService,
              public tricksService: TricksService) {
    this.constants = constants;
    this.getPaymentCards();
  }

  ngOnInit() {

  }

  getPaymentCards() {
    this.paymentCardsProcessing = true;
    this.billingService.getCards(this.securityService.getLoginModel().company)
      .subscribe(cards => {
          this.cards = cards;
          this.paymentCardsProcessing = false;
        },
        err => {
          console.error(err);
          this.paymentCardsProcessing = false;
        }
      );

  }

  openAddPaymentCard() {
    this.dialog.closeAll();
    this.updateCreditCardDialogRef = this.dialog.open(dialogsMap['add-payment-card-dialog'], addPaymentCardDialogConfig);
    this.updateCreditCardDialogRef.componentInstance.cards = this.cards;
    this.updateCreditCardDialogRef
      .afterClosed()
      .subscribe(result => {
        this.updateCreditCardDialogRef = null;
      });

    this.updateCreditCardDialogRef.componentInstance.onPaymentCardAdd.subscribe((card: any) => {
      this.getPaymentCards();
    });

  }

  openRemoveCardConfirm(card) {
    let properties = {
      title: 'Are you sure that you want to remove current credit card?',
      message: `<img width="27px" height="17px" src="assets/img/credit-cards-types/${this.tricksService.replaceSpases(card.brand)}.png"/>
                 &nbsp;&nbsp;<span>${card.brand} ending in ${card.last4}</span>`,
      messageStyle: {'display': 'flex', 'align-items': 'center'},
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      () => {
        this.removeCard(card.id);
      },
      err => {
        console.error(err);
      }
    );
  }

  removeCard(cardId: any) {
    this.paymentCardsProcessing = true;
    this.billingService.deleteCard(this.securityService.getLoginModel().company, cardId)
      .subscribe(
        response => {
          this.getPaymentCards();
        },
        err => {
          console.error(err);
          this.paymentCardsProcessing = false;
        });
  }

  openAddMoney() {
    this.dialog.closeAll();
    this.addMoneyDialogRef = this.dialog.open(dialogsMap['add-money-dialog'], addMoneyDialogConfig);
    this.addMoneyDialogRef
      .afterClosed()
      .subscribe(result => {
        this.addMoneyDialogRef = null;
      });
    this.addMoneyDialogRef.componentInstance.card = this.cards[0];
    this.addMoneyDialogRef.componentInstance.onMoneyAdded.subscribe((card: any) => {
    });

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

}
