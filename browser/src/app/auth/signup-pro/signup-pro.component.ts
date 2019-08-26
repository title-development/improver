import { Component, OnDestroy } from '@angular/core';

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
import { Subject } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'signup-pro-page',
  templateUrl: 'signup-pro.component.html',
  styleUrls: ['signup-pro.component.scss']
})

export class SignupProComponent implements OnDestroy {
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
    referralCode: ''
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
    this.mediaQueryService.screen.pipe(takeUntil(this.destroyed$)).subscribe((mediaQuery: MediaQuery) => {
      this.mediaQuery = mediaQuery;
    });
  }

  registerContractor(form) {
    this.registrationService.registerContractor(this.user)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: HttpResponse<any>) => {
        this.clearReferralCode();
        this.securityService.loginUser(JSON.parse(response.body) as LoginModel, response.headers.get('authorization'), true)
          .then((result) => {
              if (result) {
                this.popUpMessageService.showSuccess('Pro Account successfully created.');
              }
            }
          );
      }, err => {
        if (err.status == 401) {
          this.securityService.systemLogout();
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
