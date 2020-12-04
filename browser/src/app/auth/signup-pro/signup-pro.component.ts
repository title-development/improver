import { Component, OnDestroy, ViewChild } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { TextMessages } from 'app/util/text-messages';
import { RegistrationService } from '../../api/services/registration.service';
import { TricksService } from '../../api/services/tricks.service';
import { LoginModel, RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
import { PopUpMessageService } from '../../api/services/pop-up-message.service';
import { HttpResponse } from '@angular/common/http';
import { clone, getErrorMessage, removePhoneMask } from '../../util/functions';
import { MediaQuery, MediaQueryService } from '../../api/services/media-query.service';
import { Subject, throwError } from 'rxjs';
import { ActivatedRoute, Params } from '@angular/router';
import { finalize, first, mergeMap, takeUntil, timeoutWith } from 'rxjs/operators';
import { RecaptchaComponent } from 'ng-recaptcha';
import { dialogsMap } from "../../shared/dialogs/dialogs.state";
import { phoneValidationDialogConfig } from "../../shared/dialogs/dialogs.configs";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { CaptchaTrackingService } from "../../api/services/captcha-tracking.service";


@Component({
  selector: 'signup-pro-page',
  templateUrl: 'signup-pro.component.html',
  styleUrls: ['signup-pro.component.scss']
})

export class SignupProComponent implements OnDestroy {

  @ViewChild(RecaptchaComponent)
  captcha: RecaptchaComponent;
  phoneValidationDialog: MatDialogRef<any>;
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
    agree: true
  };
  mediaQuery: MediaQuery;
  private readonly REFERRAL_CODE_STORAGE_KEY: string = 'REFERRAL_CODE';
  private referralQueryParamKey: string = 'referer';
  private readonly destroyed$: Subject<void> = new Subject();

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: TextMessages,
              public tricksService: TricksService,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService,
              public captchaTrackingService: CaptchaTrackingService,
              private mediaQueryService: MediaQueryService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
  ) {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params: Params) => {
      this.user.referralCode = this.useReferralCode(params);
    });
    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mediaQuery => this.mediaQuery = mediaQuery);
  }

  submitContractorRegistration() {
      this.openPhoneValidationDialog();
  }

  registerContractor() {
    this.processing = true;

    let registrationUserModel: RegistrationUserModel = clone(this.user);
    registrationUserModel.phone = removePhoneMask(registrationUserModel.phone);

    let registrationObservable;

    if (this.captcha) {
      this.captcha.execute();
      this.captchaTrackingService.captchaDialogChange().subscribe(() => {
        this.resetCaptcha()
        this.processing = false;
      });
      registrationObservable = this.captcha.resolved.pipe(
        first(),
        timeoutWith(this.constants.ONE_MINUTE, throwError({error: {message: 'Timeout error please try again later'}})),
        mergeMap((captcha: string | null) => {
          if (!captcha) {
            return throwError({error: {message: 'Captcha is expired please try again later'}});
          }

          registrationUserModel.captcha = captcha;

          return this.registrationService.registerContractor(registrationUserModel);
        }),
      )
    } else {
      registrationObservable = this.registrationService.registerContractor(registrationUserModel)
    }

    registrationObservable
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.processing = false)
      )
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
      this.resetCaptcha()
      if (err.status == 401) this.securityService.logoutFrontend()
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

  openPhoneValidationDialog() {
    this.phoneValidationDialog = this.dialog.open(dialogsMap['phone-validation-dialog'], phoneValidationDialogConfig);
    this.phoneValidationDialog
      .afterClosed()
      .subscribe(result => {
        this.phoneValidationDialog = null;
      });
    this.phoneValidationDialog.componentInstance.phoneNumber = this.user.phone;
    this.phoneValidationDialog.componentInstance.showEditButton = false;
    this.phoneValidationDialog.componentInstance.onSuccess
      .pipe(takeUntil(this.phoneValidationDialog.afterClosed()))
      .subscribe(() => {
        this.registerContractor()
      });
  }

  resetCaptcha(captcha = this.captcha) {
    if (this.captcha) this.captcha.reset();
  }

}
