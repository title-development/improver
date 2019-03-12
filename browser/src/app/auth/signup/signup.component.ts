import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SecurityService } from "../security.service";
import { Constants } from "../../util/constants";
import { Messages } from "app/util/messages";
import { RegistrationService } from '../../api/services/registration.service';
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SystemMessageType } from "../../model/data-model";
import { AuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { HttpResponse } from '@angular/common/http';
import { LoginModel, RegistrationUserModel, RegistrationUserProps } from '../../model/security-model';
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


  user: RegistrationUserModel = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  };

  registerProps: RegistrationUserProps = {
    confirmPassword: '',
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
              private popUpMessageService: PopUpMessageService) {

  }

  registerCustomer() {
    this.registrationProcessing = true;
    this.registrationService
      .registerCustomer(this.user)
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
    this.registrationService.resendActivationMail(null, this.user.email).subscribe(
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
    this.registrationService.changeActivationMail({oldValue: this.user.email, newValue: this.correctEmailModel.correctEmail}).subscribe(
      response => {
        this.popUpMessageService.showMessage({
          type: SystemMessageType.SUCCESS,
          text: "A confirmation link has been to your corrected email"
        });
        this.user.email = this.correctEmailModel.correctEmail;
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
    );
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

}
