import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { HttpResponse } from '@angular/common/http';
import { LoginModel } from '../../model/security-model';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';
import { SocialConnectionsService } from '../social-connections.service';
import { SecurityService } from '../security.service';
import { dialogsMap } from '../../shared/dialogs/dialogs.state';
import { phoneRequestDialogConfig } from '../../shared/dialogs/dialogs.configs';
import { MatDialog, MatDialogRef } from '@angular/material';

export enum SocialPlatform {
  FACEBOOK = 'Facebook',
  GOOGLE = 'Google'
}

@Component({
  selector: 'social-buttons',
  templateUrl: './social-buttons.component.html',
  styleUrls: ['./social-buttons.component.scss']
})
export class SocialButtonsComponent {

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
  private phoneRequestDialogRef: MatDialogRef<any>;

  constructor(private socialLoginService: SocialConnectionsService,
              private socialAuthService: AuthService,
              public securityService: SecurityService,
              public dialog: MatDialog) {
  }


  socialLogin(socialPlatform: SocialPlatform) {
    if (this.preventLogin) {

      return;
    }
    let socialPlatformProvider;
    if (socialPlatform == SocialPlatform.FACEBOOK) {
      this.facebookFetching = true;
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (socialPlatform == SocialPlatform.GOOGLE) {
      this.googleFetching = true;
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.socialAuthService.signOut()
      .then(() => {
        this.socialSignIn(socialPlatformProvider, socialPlatform);
      })
      .catch(err => {
        this.socialSignIn(socialPlatformProvider, socialPlatform);
      });
  }

  private contractorRegistrationDialog(socialPlatform: SocialPlatform, userData: SocialUser) {
    this.googleFetching = false;
    this.facebookFetching = false;
    this.phoneRequestDialogRef = this.dialog.open(dialogsMap['contractor-registration-phone-request'], phoneRequestDialogConfig);
    this.phoneRequestDialogRef
      .afterClosed()
      .subscribe(result => {
        this.phoneRequestDialogRef = null;
      });
    this.phoneRequestDialogRef.componentInstance.socialUser = userData;
    this.phoneRequestDialogRef.componentInstance.socialPlatform = socialPlatform;
  }

  private loginOrRegisterUser(socialPlatform: SocialPlatform, userData: SocialUser) {
    let observable;
    if (socialPlatform == SocialPlatform.FACEBOOK) {
      observable = this.socialLoginService.facebookApiLogin(userData.authToken);
    } else {
      observable = this.socialLoginService.googleApiLogin(userData.idToken);
    }
    observable.subscribe((response: HttpResponse<any>) => {
      this.googleFetching = false;
      this.facebookFetching = false;
      this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), !this.contractorRegistrationFlow);
    }, err => {
      this.googleFetching = false;
      this.facebookFetching = false;
      if (err.status == 401) {
        this.securityService.systemLogout();
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

  private socialSignIn(socialPlatformProvider, socialPlatform) {
    this.socialAuthService.signIn(socialPlatformProvider)
      .then((userData: SocialUser) => {
          if (userData && userData.id) {
            if (this.contractorRegistrationFlow) {
              this.contractorRegistrationDialog(socialPlatform, userData);
            } else {
              this.loginOrRegisterUser(socialPlatform, userData);
            }
          } else {
            this.showError(socialPlatform);
          }
        }
      )
      .catch(err => {
        this.showError(socialPlatform);
      });
  }

}
