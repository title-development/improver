import { Component, Input, ViewChild } from '@angular/core';
import { Constants } from "../../util/constants";
import { Messages } from "../../util/messages";
import { SystemMessageType } from "../../model/data-model";
import { getErrorMessage } from "../../util/functions";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { RegistrationService } from "../../api/services/registration.service";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RegistrationHelper } from "../../util/registration-helper";

@Component({
  selector: 'email-verification-card',
  templateUrl: './email-verification-card.component.html',
  styleUrls: ['./email-verification-card.component.scss']
})
export class EmailVerificationCardComponent {

  @ViewChild('changeEmailForm') public changeEmailFormElement: FormGroup

  @Input() public email: string;
  @Input() public isEmailEditable: boolean = false;

  public correctEmail: string;
  public isResendBlocked: boolean = false;

  constructor(public constants: Constants,
              public messages: Messages,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              public registrationHelper: RegistrationHelper,
              private router: Router,
              private route: ActivatedRoute) {

    if(!registrationHelper.email) {
      this.router.navigate(['/login'])
    } else {
      this.email = registrationHelper.email
      this.isEmailEditable = registrationHelper.isEmailEditable
    }
    
  }

  resendConfirmation() {
    if (!this.isResendBlocked) {
      this.setResendConfirmationTimeout();
      this.isResendBlocked = true;
      this.registrationService.resendActivationMail(null, this.email).subscribe(
        response => {
          this.popUpMessageService.showMessage({
            type: SystemMessageType.SUCCESS,
            text: 'A confirmation link has been resent to your email'
          });
        },
        err => {
          console.error(err);
          this.isResendBlocked = false;
          this.popUpMessageService.showError(getErrorMessage(err));
        }
      );
    }
  }

  changeConfirmationEmail() {
    this.registrationService.changeActivationMail({
      oldValue: this.email,
      newValue: this.correctEmail
    }).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: 'A confirmation link has been sent to your corrected email'
        });
        this.email = this.correctEmail;
        this.changeEmailFormElement.reset();
        (this.changeEmailFormElement as any).resetForm();
      },
      err => {
        console.error(err);
        this.popUpMessageService.showError(getErrorMessage(err));
      }
    );
  }

  setResendConfirmationTimeout(){
    setTimeout(() => {
      this.isResendBlocked = false;
    }, this.constants.CONFIRMATION_RESEND_BLOCK_TIMEOUT);
  }

}
