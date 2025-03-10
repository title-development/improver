import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PhoneValidationConfirm } from "../../api/models/PhoneValidationConfirm";
import { finalize } from "rxjs/operators";
import { SecurityService } from "../../auth/security.service";
import { PhoneService } from "../../api/services/phone.service";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { removePhoneMask } from "../../util/functions";

@Component({
  selector: 'phone-validation',
  templateUrl: './phone-validation.component.html',
  styleUrls: ['./phone-validation.component.scss']
})
export class PhoneValidationComponent implements OnInit {

  removePhoneMask = removePhoneMask;

  RESEND_DISABLED_SECONDS_DEFAULT = 45;

  @Input() phoneNumber;
  @Input() showEditButton = false;
  @Output() onSuccess :EventEmitter<any> = new EventEmitter<boolean>();
  @Output() onPhoneNumberChangeClick :EventEmitter<any> = new EventEmitter<boolean>();

  phoneValidationConfirm: PhoneValidationConfirm = new PhoneValidationConfirm();
  loading = true;
  resendDisabledSeconds = this.RESEND_DISABLED_SECONDS_DEFAULT;
  verificationCodeIsIncorrect = false;

  constructor(public securityService: SecurityService,
              public phoneService: PhoneService,
              public popUpService: PopUpMessageService) { }

  ngOnInit() {
    this.numberValidationRequest();
  }

  numberValidationRequest() {
    this.loading = true;
    this.initDisabledResendCounter();
    this.phoneService.numberValidationRequest(this.phoneNumber)
      .pipe(finalize(() => this.loading = false))
      .subscribe(response => {
          this.phoneValidationConfirm.messageSid = response.body;
        },
        err => {
          console.error(err);
          this.popUpService.showError("Unexpected error during phone number validation. Please try again later.")
        })
  }

  numberValidationConfirm() {
    this.loading = true;
    this.phoneService.numberValidationConfirm(this.phoneValidationConfirm)
      .subscribe(() => {
          this.onSuccess.emit();
        },
        err => {
          this.loading = false;
          if (err.error.status == 422) {
            this.phoneValidationConfirm.code = "";
            this.verificationCodeIsIncorrect = true;
            this.popUpService.showError("Verification code is incorrect. Please check your phone number and try again.")
          } else {
            this.popUpService.showError("Unexpected error during phone number validation. Please try again later.")
          }
        })
  }

  onInput() {
    if(this.phoneValidationConfirm.code.length > 0) {
      this.verificationCodeIsIncorrect = false;
    }

    if(this.phoneValidationConfirm.code.length == 4) {
      this.confirm()
    }
  }

  confirm() {
    this.numberValidationConfirm()
  }

  initDisabledResendCounter() {
    this.resendDisabledSeconds = this.RESEND_DISABLED_SECONDS_DEFAULT;
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
