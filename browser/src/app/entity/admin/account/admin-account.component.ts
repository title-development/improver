import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../../api/services/user.service';
import { User } from '../../../api/models/User';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { AccountService } from '../../../api/services/account.service';
import { OldNewValue } from '../../../model/data-model';
import { NgForm, NgModel } from '@angular/forms';
import { getErrorMessage } from '../../../util/functions';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { SecurityService } from '../../../auth/security.service';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'admin-account',
  templateUrl: './admin-account.component.html',
  styleUrls: ['./admin-account.component.scss']
})
export class AdminAccountComponent {
  user: User;
  emailChangeDialog: boolean = false;
  emailConfirmPassword;
  oldEmail: string = '';
  oldNewPassword = {
    password: '',
    newPassword: '',
    confirmPassword: ''
  };
  previousEmail: string;

  @ViewChild('changeEmailForm') changeEmailForm: NgForm;

  constructor(public constants: Constants,
              public messages: Messages,
              private userService: UserService,
              private accountService: AccountService,
              private popUpService: PopUpMessageService,
              private securityService: SecurityService) {
    this.getCurrentUser();
  }

  updateAccount(form: NgForm): void {
    this.accountService.updateAccount(this.user.id.toString(), this.user).subscribe(res => {
      this.popUpService.showSuccess(`Account has been updated`);
      this.getCurrentUser();
      this.securityService.getCurrentUser();
    }, err => {
      this.popUpService.showError(`Could not update account. ${getErrorMessage(err)}`);
    });
  }

  toggleEmailChangeDialog(form: NgForm): void {
    this.emailChangeDialog = true;
  }

  updateIcon(imageBase64: string): void {
    this.accountService.updateIconBase64(this.securityService.getLoginModel().id, imageBase64).subscribe(res => {
      this.popUpService.showSuccess(`Icon has been updated`);
      this.getCurrentUser();
      this.securityService.getCurrentUser();
    }, err => {
      this.popUpService.showError(`Could not update icon`);
    });
  }

  updateEmail(form: NgForm): void {
    if (form.valid) {
      this.accountService.changeEmail(this.user.id, this.user.email, this.emailConfirmPassword).subscribe(res => {
        this.popUpService.showSuccess(`Your email is changed to <b>${this.user.email}</b> <br>
          Please, proceed to yor email and confirm that we got your email right`);
        this.emailChangeDialog = false;
      }, err => {
        this.popUpService.showError(`Could not change email. ${getErrorMessage(err)}`);
      });
    }
  }


  changePassword(form: NgForm): void {
    const {password, newPassword} = this.oldNewPassword;
    const oldNewValue: OldNewValue = new OldNewValue(password, newPassword);
    this.accountService.changePassword(this.user.id.toString(), oldNewValue).subscribe(res => {
      this.popUpService.showSuccess(`Password has been updated`);
      form.resetForm();
    }, err => this.popUpService.showError(`Could not change password. ${getErrorMessage(err)}`));
  }

  deleteAccountImage(): void {
    this.accountService.deleteIcon(this.securityService.getLoginModel().id).subscribe(
      () => {
        this.popUpService.showSuccess('Account icon has been deleted');
        this.getCurrentUser();
        this.securityService.getCurrentUser();
      }, err => {
        this.popUpService.showError(`Could not delete account icon. ${getErrorMessage(err)}`);
      });
  }

  hideChangeEmailDialog(form: NgForm): void {
    this.emailConfirmPassword = null;
    this.user.email = this.oldEmail;
    form.resetForm();
    Object.values(this.changeEmailForm.controls).forEach(control => control.markAsPristine());
  }

  private getCurrentUser(): void {
    this.accountService.getAccount(this.securityService.getLoginModel().id).subscribe((user: User) => {
      this.user = user;
      this.oldEmail = user.email;
      this.previousEmail = user.email;
    }, err => {
      console.log(err);
    });
  }
}
