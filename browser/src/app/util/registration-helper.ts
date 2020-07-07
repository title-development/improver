import { Injectable } from "@angular/core";
import { dialogsMap } from "../shared/dialogs/dialogs.state";
import { confirmDialogConfig } from "../shared/dialogs/dialogs.configs";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Injectable({providedIn: 'root'})
export class RegistrationHelper {

  private emailVerificationHintDialogRef: MatDialogRef<any>;

  public email: string;
  public isRegisteredWhileProjectSubmission: boolean;
  public withoutEmail: boolean;

  constructor(public dialog: MatDialog) {
  }

  reset() {
    this.email = null;
    this.isRegisteredWhileProjectSubmission = null;
  }

  openEmailVerificationHintDialog() {
    this.emailVerificationHintDialogRef = this.dialog.open(dialogsMap['email-verification-hint-dialog'], confirmDialogConfig);
    this.emailVerificationHintDialogRef
      .afterClosed()
      .subscribe(result => {
        this.emailVerificationHintDialogRef = null;
        this.reset();
      });
  }

}
