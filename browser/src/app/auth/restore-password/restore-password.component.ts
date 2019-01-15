import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SecurityService } from "../security.service";
import { Constants } from "../../util/constants";
import { Messages } from "app/util/messages";
import { LoginModel } from "../../model/security-model";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "../../api/services/user.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { SystemMessageType } from "../../model/data-model";
import { getErrorMessage } from "../../util/functions";
import {ActivationService} from "../../api/services/activation.service";


@Component({
  selector: 'restore-password',
  templateUrl: 'restore-password.component.html',
  styleUrls: ['../shared/auth.scss']
})


export class RestorePasswordComponent {

  step = 1;

  credentials = {
    email: "",
    password: "",
    confirmPassword: ""
  };

  private token: string;
  private sub: any;

  SystemMessageType = SystemMessageType;
  showMessage: boolean;
  messageText: string;

  constructor (
    public securityService: SecurityService,
    public userService: UserService,
    public activationService: ActivationService,
    public constants: Constants,
    public messages: Messages,
    public popUpMessageService: PopUpMessageService,
    private route: ActivatedRoute) {

    this.sub = this.route.params.subscribe(params => {
      params['token'] ? this.token = params['token'].toString() : this.token = "";
      if (this.token) {
        this.step = 3;
      }
    });

  }

  restorePasswordRequest(form: NgForm) {
    this.userService.restorePasswordRequest(this.credentials.email).subscribe(response => {
      this.step = 2;
    }, err => {
      this.popUpMessageService.showError(err.statusText);
    });

  }

  restorePassword(form: NgForm) {
    this.activationService.confirmPasswordReset(this.credentials, this.token).subscribe(response => {
      console.log(response);
      this.securityService.loginUser(JSON.parse(response.body) as LoginModel, response.headers.get('authorization'), true);
      // this.step = 4;
      this.popUpMessageService.showSuccess('Password changed successfully');
    }, err => {
      console.log(err);
      this.messageText = getErrorMessage(err);
      this.showMessage = true;
    });

  }

  onMessageHide(event) {
    this.showMessage = event;
  }

}




