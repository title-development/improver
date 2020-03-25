import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { HttpResponse } from '@angular/common/http';
import { LoginModel, SocialUserInfo, AdditionalUserInfo } from '../../model/security-model';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';
import { SocialConnectionsService } from '../social-connections.service';
import { SecurityService } from '../security.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { socialRegistrationAdditionalInfoDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

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
  @Input() contractorRegistrationFlow: boolean = false;
  @Output() responseMessage: EventEmitter<string> = new EventEmitter<string>();
  @Output() responseMessageType: EventEmitter<SystemMessageType> = new EventEmitter<SystemMessageType>();
  @Output() showMessage: EventEmitter<boolean> = new EventEmitter<boolean>();

  SocialPlatform = SocialPlatform;
  facebookFetching: boolean = false;
  googleFetching: boolean = false;
  private socialRegistrationAdditionalInfoDialogRef: MatDialogRef<any>;

  constructor(private socialLoginService: SocialConnectionsService,
              private socialAuthService: AuthService,
              public securityService: SecurityService,
              public dialog: MatDialog) {
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
    this.socialSignIn(socialPlatform);
  }

  private socialRegistrationAdditionalInfoDialog(userData: SocialUser, phoneRequired: boolean, registrationHandler: Function) {
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

    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.phoneMissing = phoneRequired;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.emailMissing = !userData.email;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.userName = userData.name;
    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.socialPlatform = userData.provider;

    this.socialRegistrationAdditionalInfoDialogRef.componentInstance.onSuccess.subscribe(additionalContacts => {
      registrationHandler(userData, additionalContacts);
      this.socialRegistrationAdditionalInfoDialogRef.close();
    })

  }

  // TODO: 1. Combine loginOrRegisterUser and loginOrRegisterPro into 1 method, as they are almost identical
  // TODO: 2. Required call to server to check is user already registered, so on every login we will not ask for email and Phone. This may also required to split into 2 separate methods for login and register.
  private loginOrRegisterUser(socialUser: SocialUser, additionalUserInfo: AdditionalUserInfo) {
    let accessToken = this.retrieveAccessToken(socialUser);
    let socialUserInfo: SocialUserInfo = new SocialUserInfo(accessToken, additionalUserInfo?.email, additionalUserInfo?.phone, this.referralCode);
    let observable = this.getRegistrationObservable(socialUser.provider, socialUserInfo);
    observable.subscribe((response: HttpResponse<any>) => {
      this.googleFetching = false;
      this.facebookFetching = false;
      this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
    }, err => {
      this.googleFetching = false;
      this.facebookFetching = false;
      if (err.status == 401) {
        this.securityService.logoutFrontend();
      }
      this.responseMessage.emit(getErrorMessage(err));
      this.responseMessageType.emit(SystemMessageType.ERROR);
      this.showMessage.emit(true);
    });
  }

  private loginOrRegisterPro(socialUser: SocialUser, additionalUserInfo: AdditionalUserInfo) {
    let accessToken = this.retrieveAccessToken(socialUser);
    let socialUserInfo: SocialUserInfo = new SocialUserInfo(accessToken, additionalUserInfo?.email, additionalUserInfo?.phone, this.referralCode);
    let observable = this.getRegistrationObservable(socialUser.provider, socialUserInfo, true);
    observable.subscribe((response: HttpResponse<any>) => {
      this.googleFetching = false;
      this.facebookFetching = false;
      this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
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

  private showError(socialPlatform: SocialPlatform): void {
    this.googleFetching = false;
    this.facebookFetching = false;
    this.responseMessage.emit(`Cannot connect to ${socialPlatform} api`);
    this.responseMessageType.emit(SystemMessageType.ERROR);
    this.showMessage.emit(true);
  }

  private socialSignIn(socialPlatform) {
    this.socialAuthService.signIn(socialPlatform)
      .then((socialUser: SocialUser) => {
          if (socialUser && socialUser.id) {
            if (this.contractorRegistrationFlow) {
              this.socialRegistrationAdditionalInfoDialog(socialUser, true, this.loginOrRegisterPro.bind(this));
            } else {
              if (socialUser.email) {
                this.loginOrRegisterUser(socialUser, null);
              } else {
                this.socialRegistrationAdditionalInfoDialog(socialUser, false, this.loginOrRegisterUser.bind(this));
              }
            }
          } else {
            this.showError(socialPlatform);
          }
        }
      )
      .catch(err => {
        console.log(err);
        this.showError(socialPlatform);
      });
  }

  private getRegistrationObservable(provider, socialUserInfo, isPro: boolean = false) {
    switch (provider) {
      case SocialPlatform.FACEBOOK:
        return isPro ? this.socialLoginService.proFacebookApiRegister(socialUserInfo) : this.socialLoginService.facebookApiLogin(socialUserInfo);
      case SocialPlatform.GOOGLE:
        return isPro ? this.socialLoginService.proGoogleApiRegister(socialUserInfo) : this.socialLoginService.googleApiLogin(socialUserInfo);
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
