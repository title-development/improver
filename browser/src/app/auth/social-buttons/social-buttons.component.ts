import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { HttpResponse } from '@angular/common/http';
import { AdditionalUserInfo, LoginModel, Role, SocialConnectionConfig } from '../../model/security-model';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';
import { SocialLoginService } from '../../api/services/social-login.service';
import { SecurityService } from '../security.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { socialRegistrationAdditionalInfoDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { Router } from "@angular/router";
import { RegistrationHelper } from "../../util/registration-helper";

export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  GOOGLE = 'GOOGLE'
}

@Component({
  selector: 'social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss']
})
export class SocialButtonsComponent {

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

  constructor(private socialLoginService: SocialLoginService,
              private socialAuthService: SocialAuthService,
              public securityService: SecurityService,
              public popUpService: PopUpMessageService,
              private router: Router,
              public dialog: MatDialog,
              public registrationHelper: RegistrationHelper) {
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
    console.log(socialConnectionConfig);
    let observable = this.getRegisterObservable(socialUser.provider, socialConnectionConfig, isPro);
    observable.subscribe((response: HttpResponse<any>) => {
      this.googleFetching = false;
      this.facebookFetching = false;
      let loginModel = response.body as LoginModel;
      if (loginModel) {
        this.securityService.loginUser(loginModel, response.headers.get('authorization'), true);
      } else if (!isPro) {
        this.registrationHelper.email = additionalUserInfo.email;
        this.registrationHelper.isRegisteredWhileProjectSubmission = true;
        this.router.navigate(['/signup/email-verification-hint'])
      }
    }, err => {
      this.googleFetching = false;
      this.facebookFetching = false;
      if (err.status == 401) {
        this.securityService.logoutFrontend();
        this.responseMessage.emit(getErrorMessage(err));
      } else {
        this.responseMessage.emit(getErrorMessage(err));
      }
      this.responseMessageType.emit(SystemMessageType.ERROR);
      this.showMessage.emit(true);
    });
  }

  private showError(socialPlatform: SocialPlatform, message?: string): void {
    this.googleFetching = false;
    this.facebookFetching = false;
    if (message) {
      this.responseMessage.emit(message);
    } else {
      this.responseMessage.emit(`Cannot connect to ${socialPlatform} api`);
    }
    this.responseMessageType.emit(SystemMessageType.ERROR);
    this.showMessage.emit(true);
  }

  private socialProviderAuth(socialPlatform: SocialPlatform) {
    this.socialAuthService.signIn(socialPlatform)
      .then((socialUser: SocialUser) => {
          let observable = this.getLoginObservable(socialPlatform, socialUser);
          observable.subscribe(response => {
            let loginModel: LoginModel = response.body as LoginModel;
            if (this.inQuestionary && loginModel.role != Role.CUSTOMER) {
              console.info(loginModel.role + " cannot  request a project")
              this.securityService.cleanUserLoginData();
              this.popUpService.showError("Only customers can request a project");
              // TODO: Taras, error message are not shown
              this.showError(null, "Only customers can request a project");
            } else {
              this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
            }
            }, err => {
              if (err.status == 404) {
                this.socialSignIn(socialUser);
              } else {
                console.error(err);
                this.popUpService.showError(getErrorMessage(err));
                this.googleFetching = false;
                this.facebookFetching = false;
              }
            }
          );
        }
      )
      .catch(err => {
        console.error(err);
        this.showError(socialPlatform);
      });

  }

  private socialSignIn(socialUser: SocialUser) {
    if (socialUser && socialUser.id) {
      let needAdditionalInfo = this.isPro || !this.isPro && !socialUser.email;
      if(needAdditionalInfo) {
        this.openSocialRegistrationAdditionalInfoDialog(socialUser, this.isPro,  this.register.bind(this));
      } else {
        this.register(socialUser, null, this.isPro);
      }

    } else {
      this.showError(socialUser.provider as SocialPlatform);
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

}
