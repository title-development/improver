import { ApplicationRef, Component, OnDestroy } from '@angular/core';

import { SecurityService } from '../security.service';
import { Constants } from '../../util/constants';
import { Messages } from 'app/util/messages';
import { RegistrationService } from '../../api/services/registration.service';
import { TricksService } from '../../util/tricks.service';
import {
  LoginModel,
  RegistrationUserModel,
  RegistrationUserProps
} from '../../model/security-model';
import { PopUpMessageService } from '../../util/pop-up-message.service';
import { HttpResponse } from '@angular/common/http';
import { getErrorMessage } from '../../util/functions';
import { SystemMessageType } from '../../model/data-model';


@Component({
  selector: 'signup-pro-page',
  templateUrl: 'signup-pro.component.html',
  styleUrls: ['signup-pro.component.scss']
})

export class SignupProComponent {
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
  };

  registerProps: RegistrationUserProps = {
    confirmPassword: '',
    agree: false
  };

  constructor(public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              public tricksService: TricksService,
              public popUpMessageService: PopUpMessageService,
              public registrationService: RegistrationService) {

  }

  registerConractor(form) {
    this.registrationService.registerContractor(this.user).subscribe((response: HttpResponse<any>) => {
      this.securityService.loginUser(JSON.parse(response.body) as LoginModel, response.headers.get('authorization'), true);
    }, err => {
      if (err.status == 401) {
        this.securityService.systemLogout();
        this.popUpMessageService.showError(getErrorMessage(err));
      } else {
        this.popUpMessageService.showError(getErrorMessage(err))
      }
    });
  }

  onMessageHide(event) {
    this.showMessage = event;
  }
}
