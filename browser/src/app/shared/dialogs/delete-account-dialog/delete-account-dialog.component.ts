import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { SecurityService } from '../../../auth/security.service';
import { Messages } from '../../../util/messages';
import { Constants } from '../../../util/constants';
import { UserService } from '../../../api/services/user.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../util/functions';
import { NgForm } from '@angular/forms';
import { Account } from '../../../model/data-model';
import { Role } from '../../../model/security-model';

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
              public messages: Messages,
              private userService: UserService,
              private popupService: PopUpMessageService) {
    this.basePath = this.securityService.hasRole(Role.CONTRACTOR) ? 'pro' : 'my'
  }

  close() {
    this.currentDialogRef.close();
  }

  deleteAccount(form: NgForm): void {
    if (form.valid) {
      this.processing = true;
      this.userService.deleteMyAccount(this.password).subscribe(
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
