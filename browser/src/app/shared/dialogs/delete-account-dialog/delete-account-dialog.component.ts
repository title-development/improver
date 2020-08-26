import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { TextMessages } from '../../../util/text-messages';
import { Constants } from '../../../util/constants';
import { UserService } from '../../../api/services/user.service';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import { getErrorMessage } from '../../../util/functions';
import { NgForm } from '@angular/forms';
import { Account } from '../../../model/data-model';
import { Role } from '../../../model/security-model';
import {AccountService} from "../../../api/services/account.service";

@Component({
  selector: 'delete-account-dialog',
  templateUrl: './delete-account-dialog.component.html',
  styleUrls: ['./delete-account-dialog.component.scss']
})
export class DeleteAccountDialogComponent {
  password: string;
  account: Account;
  processing: boolean = false;
  basePath: string = 'my';

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: TextMessages,
              private userService: UserService,
              private popupService: PopUpMessageService,
              private accountService: AccountService) {
    this.basePath = this.securityService.hasRole(Role.CONTRACTOR) ? 'pro' : 'my'
  }

  close() {
    this.currentDialogRef.close();
  }

  deleteAccount(form: NgForm): void {
    if (form.valid) {
      this.processing = true;
      this.accountService.deleteMyAccount(this.password).subscribe(
        res => {
          this.processing = false;
          this.popupService.showSuccess('Your account has been deleted.');
          this.currentDialogRef.close();
          this.securityService.logout();
        },
        err => {
          this.processing = false;
          this.popupService.showError(getErrorMessage(err));
        }
      );
    }
  }
}
