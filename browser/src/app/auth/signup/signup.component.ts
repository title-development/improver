import { Component, OnDestroy, ViewChild } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { RegistrationService } from '../../api/services/registration.service';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { SystemMessageType } from '../../model/data-model';
import { RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
import { RecaptchaComponent } from 'ng-recaptcha';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router } from "@angular/router";

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

  correctEmailModel = {
    correctEmail: ''
  };

  readonly confirmationResendBlockingTime: number = 15000;
  showMessage: boolean;
  messageType: string;
  messageText: string;
  step: number = 1;
  registrationProcessing = false;

  isResendBlocked: boolean = false;

  private readonly destroyed$ = new Subject<void>();

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private router: Router,
              private route: ActivatedRoute,
              private registrationService: RegistrationService,
              private popUpMessageService: PopUpMessageService) {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.user.email = params['email'];
        this.step = 2;
        this.router.navigate([], {replaceUrl: true});
      }
    });

  }

  registerCustomer() {
    this.registrationProcessing = true;
    this.recaptcha.execute();
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
          this.registrationProcessing = false;
          this.step = 2;
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

  setResendConfirmationTimeout(){
      setTimeout(() => {
        this.isResendBlocked = false;
      }, this.confirmationResendBlockingTime);
  }

  resendConfirmation() {
    if (!this.isResendBlocked) {
      this.setResendConfirmationTimeout();
      this.isResendBlocked = true;
      this.registrationService.resendActivationMail(null, this.user.email).subscribe(
        response => {
          this.popUpMessageService.showMessage({
            type: SystemMessageType.SUCCESS,
            text: 'A confirmation link has been resent to your email'
          });
        },
        err => {
          console.log(err);
          this.isResendBlocked = false;
          this.popUpMessageService.showError(JSON.parse(err.error).message);
        }
      );
    }
  }

  changeConfirmationEmail() {
    this.registrationService.changeActivationMail({
      oldValue: this.user.email,
      newValue: this.correctEmailModel.correctEmail
    }).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: 'A confirmation link has been sent to your corrected email'
        });
        this.user.email = this.correctEmailModel.correctEmail;
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
    );
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

}
