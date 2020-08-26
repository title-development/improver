import { Component, OnInit } from '@angular/core';
import { finalize } from "rxjs/operators";
import { SecurityService } from "../../auth/security.service";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { Constants } from "../../util/constants";
import { RegistrationService } from "../../api/services/registration.service";

@Component({
  selector: 'user-activation-reminder',
  templateUrl: './user-activation-reminder.component.html',
  styleUrls: ['./user-activation-reminder.component.scss']
})
export class UserActivationReminderComponent implements OnInit {

  loading = true;
  resendDisabledSeconds = 0;

  constructor(public securityService: SecurityService,
              public registrationService: RegistrationService,
              public popUpService: PopUpMessageService,
              public constants: Constants) { }

  ngOnInit() {
  }

  resendConfirmationEmail() {
    this.loading = true;
    this.initDisabledResendCounter();
    this.registrationService.resendActivationMail(this.securityService.getLoginModel().id)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
          this.popUpService.showSuccess("We have sent a confirmation link to your email address")
        },
        err => {
          console.error(err);
          this.popUpService.showError("Unexpected error. Please try again later.")
        })
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
