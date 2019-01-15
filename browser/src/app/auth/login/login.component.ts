import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { LoginModel } from '../../model/security-model';
import { SystemMessageType } from '../../model/data-model';
import { ProjectService } from '../../api/services/project.service';
import { HttpResponse } from '@angular/common/http';
import { getErrorMessage } from '../../util/functions';
import { ErrorHandler } from '../../util/error-handler';
import { FacebookLoginProvider, GoogleLoginProvider, AuthService, SocialUser } from 'angular5-social-login';
import { SocialConnectionsService } from '../social-connections.service';

@Component({
  selector: 'login-page',
  templateUrl: 'login.component.html',
  styleUrls: ['../shared/auth.scss']
})
export class LoginComponent implements OnDestroy {

  credentials = {
    email: '',
    password: ''
  };

  showMessage: boolean;
  messageType: string;
  messageText: string;

  facebookFetching: boolean = false;
  googleFetching: boolean = false;
  processing: boolean =false;

  constructor(
    public securityService: SecurityService,
    public projectService: ProjectService,
    public constants: Constants,
    public messages: Messages,
    private errorHandler: ErrorHandler,
    private socialLoginService: SocialConnectionsService,
    private socialAuthService: AuthService
  ) {

  }

  onSubmit(form: NgForm) {
    this.processing = true;
    this.securityService.sendLoginRequest(this.credentials).subscribe((response: HttpResponse<any>) => {
        this.processing = false;
        this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
      },
      err => {
        this.processing = false;
        if (err.status == 401) {
          this.securityService.systemLogout();
          this.messageText = getErrorMessage(err);
        } else {
          this.messageText = getErrorMessage(err);
        }
        this.messageType = SystemMessageType.ERROR;
        this.showMessage = true;
      });
  }

  socialLogin(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform == 'facebook') {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (socialPlatform == 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    this.socialAuthService.signIn(socialPlatformProvider)
      .then((userData: SocialUser) => {
          let observable;
          if (socialPlatform == 'facebook') {
            observable = this.socialLoginService.facebookApiLogin(userData.token);
          } else {
            observable = this.socialLoginService.googleApiLogin(userData.idToken);
          }
          observable.subscribe((response: HttpResponse<any>) => {
            this.googleFetching = false;
            this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
          }, err => {
            if (err.status == 401) {
              this.securityService.systemLogout();
              this.messageText = getErrorMessage(err);
            } else {
              this.messageText = getErrorMessage(err);
            }
            this.googleFetching = false;
            this.messageType = SystemMessageType.ERROR;
            this.showMessage = true;
          });
        }
      );
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

  ngOnDestroy(): void {
  }


}
