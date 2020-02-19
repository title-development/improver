import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { SecurityService } from '../../../auth/security.service';
import { BillingService } from '../../../api/services/billing.service';
import { CompanyService } from '../../../api/services/company.service';
import { PaymentCard } from '../../../model/data-model';
import { StripeService } from "../../../util/stripe.service";
import { NgForm } from "@angular/forms";
import { environment } from "../../../../environments/environment";
import { PaymentService } from "../../../api/services/payment.service";
import { TricksService } from "../../../util/tricks.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";

// import {} from "Stripe";

@Component({
  selector: 'change-default-payment-card-dialog',
  templateUrl: './change-default-payment-card-dialog.component.html',
  styleUrls: ['./change-default-payment-card-dialog.component.scss']
})

export class ChangeDefaultPaymentCardDialogComponent implements OnInit, OnDestroy {

  cards: PaymentCard[];
  selectedCardId: string;
  paymentCardsProcessing = true;

  onPaymentCardSelect: EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,
              public billingService: BillingService,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public popUpMessageService: PopUpMessageService,
              public tricksService: TricksService) {

    this.getPaymentCards()

  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }


  ngOnDestroy() {

  }

  onChange({error}) {

  }

  async onSubmit(form: NgForm) {
    this.setDefaultCard(this.selectedCardId);
  }

  getPaymentCards() {
    this.billingService.getCards(this.securityService.getLoginModel().company)
      .subscribe(
        cards => {
          this.cards = cards;
          this.selectedCardId = cards[0].id;
          this.paymentCardsProcessing = false;
        },
        err => {
          this.paymentCardsProcessing = false;
          console.log(err)
        }
      );
  }

  setDefaultCard(cardId: any) {
    this.paymentCardsProcessing = true;
    this.billingService.setDefaultCard(this.securityService.getLoginModel().company, cardId)
      .subscribe(
        response => {
          console.log(response);
          this.getPaymentCards();
          this.onPaymentCardSelect.emit();
          this.close();
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err)) ;
          this.paymentCardsProcessing = false;
        });
  }

}












