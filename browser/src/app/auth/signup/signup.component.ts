import { Component, OnDestroy, ViewChild } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { RegistrationService } from '../../api/services/registration.service';
import { LoginModel, RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
import { RecaptchaComponent } from 'ng-recaptcha';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";
import { RegistrationHelper } from "../../util/registration-helper";
import { CaptchaTrackingService } from "../../api/services/captcha-tracking.service";

@Component({
  selector: 'login-page',
  templateUrl: 'signup.component.html',
  styleUrls: ['../shared/auth.scss']
})

export class SignupComponent implements OnDestroy {
  @ViewChild(RecaptchaComponent)
  recaptcha: RecaptchaComponent;

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
              public messages: Messages,
              public captchaTrackingService: CaptchaTrackingService,
              private router: Router,
              private route: ActivatedRoute,
              private registrationService: RegistrationService,
              private registrationHelper: RegistrationHelper) {

  }

  registerCustomer() {
    this.registrationProcessing = true;
    this.recaptcha.execute();
    this.captchaTrackingService.captchaDialogChange().subscribe(() => {
      this.recaptcha.reset();
      this.registrationProcessing = false;
    });
    this.recaptcha.resolved.pipe(
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
    )
      .subscribe(
        response => {
          this.registrationHelper.email = this.user.email;
          this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), false);
          this.router.navigate(['/signup/email-verification-hint'])
        },
        err => {
          this.recaptcha.reset();
          this.registrationProcessing = false;
          console.error(err);
          this.showMessage = true;
          this.messageText = err.message;
          this.messageType = 'ERROR';
        });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

}
