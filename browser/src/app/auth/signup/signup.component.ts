import { Component, OnDestroy, ViewChild } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { TextMessages } from 'app/util/text-messages';
import { RegistrationService } from '../../api/services/registration.service';
import { LoginModel, RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
import { RecaptchaComponent } from 'ng-recaptcha';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import { RegistrationHelper } from "../../util/helpers/registration-helper";
import { CaptchaTrackingService } from "../../api/services/captcha-tracking.service";

@Component({
  selector: 'signup-page',
  templateUrl: 'signup.component.html',
  styleUrls: ['../shared/auth.scss']
})

export class SignupComponent implements OnDestroy {
  @ViewChild(RecaptchaComponent)
  captcha: RecaptchaComponent;

  user: RegistrationUserModel = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    captcha: ''
  };

  registerProps: RegistrationUserProps = {
    confirmPassword: '',
  };

  showMessage: boolean;
  messageType: string;
  messageText: string;
  registrationProcessing = false;

  private readonly destroyed$ = new Subject<void>();

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: TextMessages,
              public captchaTrackingService: CaptchaTrackingService,
              private router: Router,
              private route: ActivatedRoute,
              private registrationService: RegistrationService,
              private registrationHelper: RegistrationHelper) {

  }

  registerCustomer() {
    this.registrationProcessing = true;
    if (this.captcha) {
      this.captcha.execute();
      this.captchaTrackingService.captchaDialogChange().subscribe(() => {
        this.resetCaptcha()
        this.registrationProcessing = false;
      });
      this.captcha.resolved.pipe(
        timeoutWith(this.constants.ONE_MINUTE, throwError({error: {message: 'Timeout error please try again later'}})),
        mergeMap((captcha: string | null) => {
          if (!captcha) {
            return throwError({error: {message: 'Captcha is expired please try again later'}});
          }
          this.user.captcha = captcha;
          return this.registrationService
            .registerCustomer(this.user);
        }),
        takeUntil(this.destroyed$),
      ).subscribe(this.handleRegistration, this.handleRegistrationError);
    } else {
      this.registrationService
        .registerCustomer(this.user)
        .subscribe(this.handleRegistration, this.handleRegistrationError)
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

  resetCaptcha(captcha = this.captcha) {
    if(captcha) {
      captcha.reset()
    }
  }

  handleRegistration = response => {
    this.registrationHelper.email = this.user.email;
    this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
    this.router.navigate(['/signup/email-verification-hint'])
  }

  handleRegistrationError = err => {
    this.resetCaptcha()
    this.registrationProcessing = false;
    console.error(err);
    this.showMessage = true;
    this.messageText = err.message;
    this.messageType = 'ERROR';
  }

}
