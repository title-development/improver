import { Component, EventEmitter, Inject, Input, OnDestroy, Output } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { AdditionalUserInfo, LoginModel, Role, SocialConnectionConfig } from '../../model/security-model';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';
import { SocialLoginService } from '../../api/services/social-login.service';
import { SecurityService } from '../security.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { socialRegistrationAdditionalInfoDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { ActivatedRoute, Router } from "@angular/router";
import { RegistrationHelper } from "../../util/helpers/registration-helper";
import { first, takeUntil } from "rxjs/operators";
import { from, Subject } from "rxjs";
import { GlobalSpinnerService } from "../../util/global-spinner.serivce";
import { SocialAuthService, SocialUser } from "../social-login/public-api";

export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE'
}

@Component({
  selector: 'social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss']
})
export class SocialButtonsComponent implements OnDestroy {

  private readonly destroyed$ = new Subject<void>();

  @Input() buttonText: string = 'Continue with'
  @Input() referralCode: string;
  @Input() preventLogin: boolean = false;
  @Input() disabled: boolean = false;
  @Input() processing: boolean = false;
  @Input() isPro: boolean = false;
  @Input() inQuestionary: boolean = false;
  @Output() responseMessage: EventEmitter<string> = new EventEmitter<string>();
  @Output() responseMessageType: EventEmitter<SystemMessageType> = new EventEmitter<SystemMessageType>();
  @Output() showMessage: EventEmitter<boolean> = new EventEmitter<boolean>();

  SocialPlatform = SocialPlatform;
  facebookFetching: boolean = false;
  googleFetching: boolean = false;
  private socialRegistrationAdditionalInfoDialogRef: MatDialogRef<any>;
  public socialAuthServiceInitialized = false;

  constructor(private socialLoginService: SocialLoginService,
              private socialAuthService: SocialAuthService,
              public securityService: SecurityService,
              public popUpService: PopUpMessageService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              public registrationHelper: RegistrationHelper,
              public globalSpinnerService: GlobalSpinnerService,
              @Inject('Window') public window: Window) {

    this.socialAuthService.initState
      .pipe(first())
      .subscribe(() => this.socialAuthServiceInitialized = true);

  }


  socialLogin(socialPlatform: SocialPlatform) {
    if (this.preventLogin) {
      return;
    }
    if (socialPlatform == SocialPlatform.FACEBOOK) {
      this.facebookFetching = true;
    } else if (socialPlatform == SocialPlatform.GOOGLE) {
      this.googleFetching = true;
    }
    this.socialProviderAuth(socialPlatform);
  }

  private openSocialRegistrationAdditionalInfoDialog(userData: SocialUser, isPro: boolean, registrationHandler: Function) {
    this.googleFetching = false;
    this.facebookFetching = false;
    this.socialRegistrationAdditionalInfoDialogRef = this.dialog.open(dialogsMap['social-registration-additional-info-dialog'], socialRegistrationAdditionalInfoDialogConfig);
    this.socialRegistrationAdditionalInfoDialogRef
      .afterClosed()
      .subscribe(result => {
        this.socialRegistrationAdditionalInfoDialogRef = null;
      });

    if (userData.provider == SocialPlatform.FACEBOOK) {
      this.socialRegistrationAdditionalInfoDialogRef.componentInstance.accessToken = userData.authToken;
    } else if (userData.provider == SocialPlatform.GOOGLE) {
      this.socialRegistrationAdditionalInfoDialogRef.componentInstance.accessToken = userData.idToken;
    }

    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.phoneMissing = isPro;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.emailMissing = !userData.email;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.userName = userData.name;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.socialPlatform = userData.provider;

    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.onSuccess.subscribe(additionalContacts => {
      registrationHandler(userData, additionalContacts, isPro);
      this.socialRegistrationAdditionalInfoDialogRef.close();
    })

  }

  private register(socialUser: SocialUser, additionalUserInfo: AdditionalUserInfo, isPro: boolean) {
    let accessToken = this.retrieveAccessToken(socialUser);
    let socialConnectionConfig: SocialConnectionConfig = new SocialConnectionConfig(accessToken, additionalUserInfo?.email, additionalUserInfo?.phone, this.referralCode, this.inQuestionary);
    let observable = this.getRegisterObservable(socialUser.provider, socialConnectionConfig, isPro);
    observable
      .pipe(takeUntil(this.destroyed$))
      .subscribe((response: HttpResponse<any>) => {
        let loginModel = response.body as LoginModel;
        if (loginModel) {
          this.securityService.loginUser(loginModel, response.headers.get('authorization'), true);
        } else if (!isPro) {
          this.registrationHelper.email = additionalUserInfo.email;
          this.registrationHelper.isRegisteredWhileProjectSubmission = true;
          this.router.navigate(['/signup/email-verification-hint'])
        }
      }, err => {
        if (err.status == 401) {
          this.securityService.logoutFrontend();
        }
        console.error(err);
        this.handleSocialLoginError(undefined, getErrorMessage(err))
      });
  }

  private handleSocialLoginError(socialPlatform: SocialPlatform, message: string = `Cannot connect to ${socialPlatform} api`, showMessage = true): void {
    this.googleFetching = false;
    this.facebookFetching = false;
    if(showMessage) {
      this.responseMessage.emit(message);
      this.responseMessageType.emit(SystemMessageType.ERROR);
      this.showMessage.emit(true);
    }
  }

  private socialProviderAuth(socialPlatform: SocialPlatform) {

    let socialProvider = this.socialAuthService.getProvider(socialPlatform)

    from(socialProvider.getProfile())
      .pipe(first())
      .subscribe((socialUser: SocialUser) => this.handleSocialUser(socialUser),
          err => {
        console.error(err);
        this.handleSocialLoginError(socialPlatform);
      })

  }

  private handleSocialUser(socialUser: SocialUser) {
    let observable = this.getLoginObservable(socialUser.provider, socialUser);
    observable
      .pipe(takeUntil(this.destroyed$))
      .subscribe(response => {
          let loginModel: LoginModel = response.body as LoginModel;
          if (this.inQuestionary && loginModel.role != Role.CUSTOMER) {
            this.securityService.cleanUserLoginData();
            this.handleSocialLoginError(null, "Only customers can request a project");
          } else {
            this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
          }
        }, err => {
          if (err.status == 404) {
            this.socialSignIn(socialUser);
          } else {
            console.error(err);
            this.handleSocialLoginError(socialUser.provider as SocialPlatform, getErrorMessage(err));
          }
        }
      );
  }

  private socialSignIn(socialUser: SocialUser) {
    if (socialUser && socialUser.id) {
      let needAdditionalInfo = this.isPro || !this.isPro && !socialUser.email;
      if (needAdditionalInfo) {
        this.openSocialRegistrationAdditionalInfoDialog(socialUser, this.isPro, this.register.bind(this));
      } else {
        this.register(socialUser, null, this.isPro);
      }

    } else {
      this.handleSocialLoginError(socialUser.provider as SocialPlatform);
    }
  }

  private getLoginObservable(socialPlatform, socialUser: SocialUser) {
    switch (socialPlatform) {
      case SocialPlatform.FACEBOOK:
        return this.socialLoginService.facebookLogin(socialUser.authToken);
      case SocialPlatform.GOOGLE:
        return this.socialLoginService.googleLogin(socialUser.idToken);
      default:
        throw Error("Social provider not allowed")
    }
  }

  private getRegisterObservable(socialPlatform, socialUserInfo, isPro: boolean = false) {
    switch (socialPlatform) {
      case SocialPlatform.FACEBOOK:
        return isPro ? this.socialLoginService.facebookRegisterPro(socialUserInfo) : this.socialLoginService.facebookRegisterCustomer(socialUserInfo);
      case SocialPlatform.GOOGLE:
        return isPro ? this.socialLoginService.googleRegisterPro(socialUserInfo) : this.socialLoginService.googleRegisterCustomer(socialUserInfo);
      default:
        throw Error("Social provider not allowed")
    }
  }

  private retrieveAccessToken(userData: SocialUser) {
    switch (userData.provider) {
      case SocialPlatform.FACEBOOK:
        return userData.authToken;
      case SocialPlatform.GOOGLE:
        return userData.idToken;
      default:
        throw Error("Social provider not allowed")
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

}
