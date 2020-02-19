import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { AccountService } from '../../../api/services/account.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';

@Component({
  selector: 'email-confirm-dialog',
  templateUrl: './email-confirm-dialog.component.html',
  styleUrls: ['./email-confirm-dialog.component.scss']
})

export class EmailConfirmDialogComponent {
  account;
  successful: boolean = false;
  password = '';
  email = '';
  properties = {
    title: 'Please confirm this action',
    message: '',
    OK: 'Confirm',
    CANCEL: 'Cancel',
  };
  object: any;
  onCancel: EventEmitter<any> = new EventEmitter<any>();
  onSuccess: EventEmitter<any> = new EventEmitter<any>();
  fetching: boolean = false;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private accountService: AccountService,
              public popupService: PopUpMessageService
  ) {
  }

  close() {
    if (this.successful) {
      this.currentDialogRef.close();
      this.onSuccess.emit(this.email);
    } else {
      this.currentDialogRef.close();
      this.onCancel.emit();
    }

  }

  changeEmail() {
    this.fetching = true;
    this.accountService
      .changeEmail(parseInt(this.securityService.getLoginModel().id), this.email, this.password)
      .subscribe(
        response => {
          this.fetching = false;
          this.successful = true;
          this.currentDialogRef.close();
          this.onSuccess.emit(this.email);
        },
        err => {
          this.fetching = false;
          this.successful = false;
          let message = err.error ? JSON.parse(err.error).message : err.statusText;
          this.popupService.showError(message);
        }
      );
  }

}





