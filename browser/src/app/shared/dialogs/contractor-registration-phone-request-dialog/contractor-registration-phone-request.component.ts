import { Component, OnDestroy } from '@angular/core';
import { AuthService, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { NgForm } from '@angular/forms';
import { SocialConnectionsService } from '../../../auth/social-connections.service';
import { SocialPlatform } from '../../../auth/social-buttons/social-buttons.component';
import { HttpResponse } from '@angular/common/http';
import { LoginModel, PhoneSocialCredentials } from '../../../model/security-model';
import { getErrorMessage } from '../../../util/functions';
import { SystemMessageType } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
  selector: 'contractor-registration-phone-request',
  templateUrl: './contractor-registration-phone-request.component.html',
  styleUrls: ['./contractor-registration-phone-request.component.scss']
})
export class ContractorRegistrationPhoneRequestComponent implements OnDestroy {
  socialUser: SocialUser;
  socialPlatform: SocialPlatform;
  referralCode: string;
  phone: string;
  showMessage: boolean = false;
  messageType: string;
  messageText: string;
  processing: boolean = false;
  private readonly destroyed$ = new Subject<void>();

  constructor(public messages: Messages,
              public currentDialogRef: MatDialogRef<any>,
              public constants: Constants,
              private securityService: SecurityService,
              private socialLoginService: SocialConnectionsService,
              private router: Router,
              private dialog: MatDialog,
              private socialAuthService: AuthService
  ) {

  }

  registerUser(form: NgForm): void {
    this.processing = true;
    this.processRegister().pipe(takeUntil(this.destroyed$)).subscribe((response: HttpResponse<any>) => {
      this.processing = false;
      this.dialog.closeAll();
      this.securityService.loginUser(response.body as LoginModel, response.headers.get('authorization'), true);
    }, err => {
      this.processing = false;
      if (getErrorMessage(err)) {
        this.showError(getErrorMessage(err));
      } else {
        this.showError(err);
      }
    });
  }

  processRegister(): Observable<any> {
    switch (this.socialPlatform) {
      case SocialPlatform.FACEBOOK:
        return this.socialLoginService.proFacebookRegister(new PhoneSocialCredentials(this.socialUser.authToken, this.phone, this.referralCode));
      case SocialPlatform.GOOGLE:
        return fromPromise<SocialUser>(this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)).pipe(
          switchMap((userData: SocialUser) => {
            if (userData && userData.id) {
              return this.socialLoginService.proGoogleApiRegister(new PhoneSocialCredentials(userData.idToken, this.phone, this.referralCode));
            }
            return throwError('Unknown error try again later');
          })
        );
      default:
        console.error('Please provide a correct social platform');
        return throwError('Please provide a correct social platform');
    }
  }

  close(): void {
    this.currentDialogRef.close();
  }

  onMessageHide(hidden: boolean) {
    this.showMessage = hidden;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private showError(message: string): void {
    this.messageText = message;
    this.messageType = SystemMessageType.ERROR;
    this.showMessage = true;
  }

}
