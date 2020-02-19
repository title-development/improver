import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { PaymentCard, SystemMessageType } from '../../../model/data-model';
import { CompanyService } from '../../../api/services/company.service';
import { BillingService } from '../../../api/services/billing.service';
import { TricksService } from '../../../util/tricks.service';
import { PaymentService } from '../../../api/services/payment.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../util/functions';
import { dialogsMap } from '../dialogs.state';
import { confirmDialogConfig } from '../dialogs.configs';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'add-money-dialog',
  templateUrl: 'add-money-dialog.component.html',
  styleUrls: ['add-money-dialog.component.scss']
})
export class AddMoneyDialogComponent implements OnInit {

  charging = false;

  card: PaymentCard;
  payment: any = {
    amount: ''
  };
  step = 1;
  public newBalance: number = 0;
  public chargeValue: number = 0;
  confirmDialogRef: MatDialogRef<any>;

  onMoneyAdded: EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public constants: Constants,
              public messages: Messages,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public billingService: BillingService,
              public paymentService: PaymentService,
              public popUpService: PopUpMessageService,
              public tricksService: TricksService) {
  }

  ngOnInit() {
    console.log(this.card);
  }

  addMoney() {
    this.charging = true;
    this.paymentService.charge(this.securityService.getLoginModel().company, this.chargeValue * 100).subscribe(
      response => {
        this.popUpService.showSuccess(`$${this.chargeValue} have been added to your account`);
        this.onMoneyAdded.emit();
        this.close();
      },
      err => {
        this.charging = false;
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }

  onInputAmount() {

    this.payment.amount = this.payment.amount.replace(/\D/g, '');

    if (!this.payment.amount || this.payment.amount == '') {
      this.chargeValue = 0;
    } else {
      this.chargeValue = parseInt(this.payment.amount);
    }

    this.newBalance = this.chargeValue * 100 + this.billingService.billing.balance;

  }

  close() {
    this.currentDialogRef.close();
  }

  onSubmit(form) {
    this.addMoney();

  }

  prepare(form: NgForm) {
    form.controls.amount.markAsTouched();
  }

}

