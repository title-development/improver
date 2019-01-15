import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material";
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
import { PopUpMessageService } from '../../../util/pop-up-message.service';

// import {} from "Stripe";

@Component({
  selector: 'add-payment-card-dialog',
  templateUrl: './add-payment-card-dialog.component.html',
  styleUrls: ['./add-payment-card-dialog.component.scss']
})

export class AddPaymentCardDialogComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cardInfo') cardInfo: ElementRef;
  @ViewChild('cardNumber') cardNumber: ElementRef;

  onPaymentCardAdd: EventEmitter<any> = new EventEmitter<any>();

  elements: any;
  cards: Array<PaymentCard>;
  card: any;
  cardHandler = this.onChange.bind(this);
  error: string;

  checkingCard = false;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,
              public billingService: BillingService,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public stripeService: StripeService,
              private cd: ChangeDetectorRef,
              private popupMessage: PopUpMessageService) {

    this.elements = stripeService.stripe.elements();

  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }

  ngAfterViewInit() {

    const style = {
      base: {
        lineHeight: '20px',
        fontSmoothing: 'antialiased',
        fontSize: '15px'
      }
    };

    this.card = this.elements.create('card', {hidePostalCode: false, style: style});
    this.card.mount(this.cardInfo.nativeElement);

    this.card.addEventListener('change', this.cardHandler);
  }

  ngOnDestroy() {
    this.card.removeEventListener('change', this.cardHandler);
    this.card.destroy();
  }

  onChange({error}) {
    if (error) {
      this.error = error.message;
    } else {
      this.error = null;
    }
    this.cd.detectChanges();
  }

  async onSubmit(form: NgForm) {
    this.error = null;
    this.checkingCard = true;
    const {token, error} = await this.stripeService.stripe.createToken(this.card);

    if (error) {
      // console.log('Something is wrong:', error);
      this.checkingCard = false;
    } else {
      // console.log('Success!', token);
      // ...send the token to the your backend to process the charge
      let stripeToken = {
        id: token.id,
        clientIp: token.client_ip,
        created: token.created
      };
      this.billingService.addCard(this.securityService.getLoginModel().company, stripeToken).subscribe(
        response => {
          // console.log(response);
          this.onPaymentCardAdd.emit();
          this.currentDialogRef.close()
        },
        response => {
          if(response.code == 409) {
            this.popupMessage.showError("You cannot add more then 5 cards")
          } else {
            this.checkingCard = false;
            this.error = JSON.parse(response.error).message;
            // console.log(response);
          }
        }
      )

    }
  }

}












