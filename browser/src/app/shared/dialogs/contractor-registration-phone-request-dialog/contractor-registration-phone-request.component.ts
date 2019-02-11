import { Component } from '@angular/core';
import { SocialLoginModule, SocialUser } from 'angularx-social-login';
import { MatDialogRef } from '@angular/material';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { NgForm } from '@angular/forms';
import { RegistrationService } from '../../../api/services/registration.service';
import { SocialConnectionsService } from '../../../auth/social-connections.service';
import { SocialPlatform } from '../../../auth/social-buttons/social-buttons.component';
import { HttpResponse } from '@angular/common/http';
import { LoginModel } from '../../../model/security-model';
import { getErrorMessage } from '../../../util/functions';
import { SystemMessageType } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { Router } from '@angular/router';

@Component({
  selector: 'contractor-registration-phone-request',
  templateUrl: './contractor-registration-phone-request.component.html',
  styleUrls: ['./contractor-registration-phone-request.component.scss']
})
export class ContractorRegistrationPhoneRequestComponent {
  socialUser: SocialUser;
  socialPlatform: SocialPlatform;
  phone: string;
  showMessage: boolean = false;
  messageType: string;
  messageText: string;
  processing: boolean = false;

  constructor(public messages: Messages,
              public currentDialogRef: MatDialogRef<any>,
              public constants: Constants,
              private securityService: SecurityService,
              private socialLoginService: SocialConnectionsService,
              private router: Router
  ) {
  }

  registerUser(form: NgForm): void {
    this.processing = true;
    let observable;
    if (this.socialPlatform == SocialPlatform.FACEBOOK) {
      observable = this.socialLoginService.proFacebookRegister({accessToken: this.socialUser.authToken, phone: this.phone});
    } else {
      observable = this.socialLoginService.proGoogleApiRegister({accessToken: this.socialUser.authToken, phone: this.phone});
    }
    observable.subscribe((response: HttpResponse<any>) => {

      this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
    }, err => {
      if (err.status == 401) {
        this.messageText = getErrorMessage(err);
      } else {
        this.messageText = getErrorMessage(err);
      }
      this.processing = false;
      this.messageType = SystemMessageType.ERROR;
      this.showMessage = true;
    });

  }

  close(): void {
    this.currentDialogRef.close();
  }

  onMessageHide(event) {
    this.showMessage = event;
  }

}
