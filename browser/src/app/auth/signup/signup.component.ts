import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SecurityService } from "../security.service";
import { Constants } from "../../util/constants";
import { Messages } from "app/util/messages";
import { RegistrationService } from '../../api/services/registration.service';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SystemMessageType } from "../../model/data-model";
import { AuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from 'angular5-social-login';
import { HttpResponse } from '@angular/common/http';
import { LoginModel } from '../../model/security-model';
import { getErrorMessage } from '../../util/functions';
import { SocialConnectionsService } from '../social-connections.service';

@Component({
  selector: 'login-page',
  templateUrl: 'signup.component.html',
  styleUrls: ['../shared/auth.scss']
})

export class SignupComponent {
  //TODO: temporary values for testing
  // model = {
  //   email: "off.bk90@gmail.com",
  //   password: "password",
  //   confirmPassword: "password",
  //   firstName: "Taras",
  //   lastName: "Halynskyi",
  //   zip: "77300",
  //   phone: "(123) 123-1231"
  // };

  facebookFetching: boolean = false;
  googleFetching: boolean = false;

  model = {
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  };

  correctEmailModel = {
    correctEmail: ""
  };

  showMessage: boolean;
  messageType: string;
  messageText: string;
  step: number = 1;
  registrationProcessing = false;

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private registrationService: RegistrationService,
              private popUpMessageService: PopUpMessageService,
              private socialLoginService: SocialConnectionsService,
              private socialAuthService: AuthService) {

  }

  onSubmit(form: NgForm) {
    this.registerCustomer();
  }

  registerCustomer() {
    this.registrationProcessing = true;
    this.registrationService
      .registerCustomer(this.model)
      .subscribe(
        response => {
          this.registrationProcessing = false;
          this.step = 2;
        },
        err => {
          this.registrationProcessing = false;
          console.error(err);
          this.showMessage = true;
          this.messageText = err.message;
          this.messageType = "ERROR";
        });
  }

  resendConfirmation() {
    this.registrationService.resendActivationMail(this.model.email).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: "A confirmation link has been resent to your email"
        })
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
    );
  }

  changeConfirmationEmail() {
    this.registrationService.changeActivationMail({oldValue: this.model.email, newValue: this.correctEmailModel.correctEmail}).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: "A confirmation link has been to your corrected email"
        });
        this.model.email = this.correctEmailModel.correctEmail;
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
    );
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

}
