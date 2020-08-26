import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Constants } from "../../util/constants";
import { TextMessages } from "../../util/text-messages";
import { getErrorMessage } from "../../util/functions";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { RegistrationService } from "../../api/services/registration.service";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { RegistrationHelper } from "../../util/helpers/registration-helper";
import { SecurityService } from "../../auth/security.service";

@Component({
  selector: 'email-verification-hint-card',
  templateUrl: './email-verification-hint-card.component.html',
  styleUrls: ['./email-verification-hint-card.component.scss']
})
export class EmailVerificationHintCardComponent implements OnInit {

  private readonly NOT_ACTIVE_USER_KEY: string = 'NOT_ACTIVE_USER';

  @ViewChild('changeEmailForm') public changeEmailFormElement: FormGroup

  @Input() public email: string;
  @Input() public isRegisteredAfterProjectSubmit: boolean = false;
  @Input() public withoutEmail: boolean = false;
  @Input() public emailCorrectionAllowed: boolean = true;

  public correctEmail: string;
  public resendDisabledSeconds = 0;

  constructor(public constants: Constants,
              public messages: TextMessages,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              public registrationHelper: RegistrationHelper,
              private router: Router,
              private route: ActivatedRoute,
              private securityService: SecurityService) {

  }

  ngOnInit(): void {
    this.withoutEmail = this.registrationHelper.withoutEmail;

    if(!this.withoutEmail && !this.registrationHelper.email) {
      this.router.navigate(['/login'])
    } else if (this.registrationHelper.email) {
      this.email = this.registrationHelper.email
    }

    if(this.registrationHelper.isRegisteredWhileProjectSubmission) {
      this.isRegisteredAfterProjectSubmit = true;
    }

    if(this.withoutEmail || this.isRegisteredAfterProjectSubmit) {
      this.emailCorrectionAllowed = false;
    }
  }


  resendConfirmation() {
      this.initDisabledResendCounter();

      const userId = this.securityService.isAuthenticated()
        ? this.securityService.getLoginModel().id
        : sessionStorage.getItem(this.NOT_ACTIVE_USER_KEY);

      if (userId || this.email) {
        this.registrationService.resendActivationMail(userId, this.email).subscribe(
          response => {
            this.popUpMessageService.showSuccess('A confirmation link has been resent to your email');
          },
          err => {
            console.error(err);
            this.popUpMessageService.showError(getErrorMessage(err));
          }
        );
      } else {
        this.popUpMessageService.showError('Resend activation to the email is not available anymore');
      }

  }

  changeConfirmationEmail() {
    this.registrationService.changeActivationMail({
      oldValue: this.email,
      newValue: this.correctEmail
    }).subscribe(
      response => {
        this.popUpMessageService.showSuccess('A confirmation link has been sent to your corrected email');
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

  initDisabledResendCounter() {
    this.resendDisabledSeconds = this.constants.CONFIRMATION_RESEND_BLOCK_TIMEOUT;
    this.tickDisableResendCounter()
  }

  tickDisableResendCounter() {
    setTimeout(() => {
      this.resendDisabledSeconds--;
      if (this.resendDisabledSeconds > 0) {
        this.tickDisableResendCounter()
      }
    }, 1000)
  }


}
