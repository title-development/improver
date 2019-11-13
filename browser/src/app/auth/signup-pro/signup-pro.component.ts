import { Component, OnDestroy, ViewChild } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { RegistrationService } from '../../api/services/registration.service';
import { TricksService } from '../../util/tricks.service';
import { LoginModel, RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { HttpResponse } from '@angular/common/http';
import { getErrorMessage } from '../../util/functions';
import { MediaQuery, MediaQueryService } from '../../util/media-query.service';
import { Subject, throwError } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { RecaptchaComponent } from 'ng-recaptcha';


@Component({
  selector: 'signup-pro-page',
  templateUrl: 'signup-pro.component.html',
  styleUrls: ['signup-pro.component.scss']
})

export class SignupProComponent implements OnDestroy {

  @ViewChild(RecaptchaComponent)
  recaptcha: RecaptchaComponent;
  agreeForSocialLogin: boolean = false;
  processing: boolean = false;
  showMessage: boolean = false;
  messageType: string;
  messageText: string;
  user: RegistrationUserModel = {
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    referralCode: '',
    captcha: ''
  };

  registerProps: RegistrationUserProps = {
    confirmPassword: '',
    agree: false
  };
  mediaQuery: MediaQuery;
  private readonly REFERRAL_CODE_STORAGE_KEY: string = 'REFERRAL_CODE';
  private referralQueryParamKey: string = 'referer';
  private readonly destroyed$: Subject<void> = new Subject();

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              public tricksService: TricksService,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              private mediaQueryService: MediaQueryService,
              private route: ActivatedRoute
  ) {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: Params) => {
      this.user.referralCode = this.useReferralCode(params);
    });
    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mediaQuery => this.mediaQuery = mediaQuery);
  }

  registerContractor(form) {
    this.recaptcha.execute();
    this.recaptcha.resolved.pipe(
      timeoutWith(this.constants.ONE_MINUTE, throwError({error: {message: 'Timeout error please try again later'}})),
      mergeMap((captcha: string | null) => {
        if (!captcha) {
          return throwError({error: {message: 'Captcha is expired please try again later'}});
        }
        this.user.captcha = captcha;
        return this.registrationService.registerContractor(this.user);
      }),
      takeUntil(this.destroyed$),
    ).subscribe((response: HttpResponse<any>) => {
      this.clearReferralCode();
      this.securityService.loginUser(JSON.parse(response.body) as LoginModel, response.headers.get('authorization'), true)
        .then((result) => {
            if (result) {
              this.popUpMessageService.showSuccess('Pro Account successfully created.');
            }
          }
        );
    }, err => {
      this.recaptcha.reset();
      if (err.status == 401) {
        this.securityService.logoutFrontend();
      }
      this.popUpMessageService.showError(getErrorMessage(err));
    });
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private useReferralCode(params): string {
    let referralCode: string = '';
    if (params[this.referralQueryParamKey]) {
      referralCode = params[this.referralQueryParamKey];
      sessionStorage.setItem(this.REFERRAL_CODE_STORAGE_KEY, referralCode);
    } else if (sessionStorage.getItem(this.REFERRAL_CODE_STORAGE_KEY)) {
      referralCode = sessionStorage.getItem(this.REFERRAL_CODE_STORAGE_KEY);
    }

    return referralCode;
  }

  private clearReferralCode(): void {
    sessionStorage.removeItem(this.REFERRAL_CODE_STORAGE_KEY);
  }
}
