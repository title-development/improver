import { Component, OnDestroy } from '@angular/core';
import { Constants } from '../../../../util/constants';
import { Messages } from '../../../../util/messages';
import { Account, OldNewValue, SystemMessageType } from '../../../../model/data-model';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../../../auth/security.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import {
  completeProjectDialogConfig,
  confirmDialogConfig,
  personalPhotoDialogConfig
} from '../../../../shared/dialogs/dialogs.configs';
import { AccountService } from '../../../../api/services/account.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { enumToArrayList, TricksService } from '../../../../util/tricks.service';
import { Role } from '../../../../model/security-model';
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { NgForm } from '@angular/forms';
import { capitalize, getErrorMessage } from '../../../../util/functions';
import { switchMap, takeUntil } from 'rxjs/operators';
import { SocialConnectionsService } from '../../../../auth/social-connections.service';
import { SocialConnection } from '../../../../api/models/SocialConnection';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from 'angularx-social-login';
import { from, Observable, Subject, throwError } from 'rxjs';


@Component({
  selector: 'personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnDestroy {

  account: Account;
  confirmDialogRef: MatDialogRef<any>;
  photoDialogRef: MatDialogRef<any>;
  deleteAccountDialogRef: MatDialogRef<any>;

  currentEmail: string;
  emailEditDisabled = true;

  oldNewPassword = {
    password: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  Role = Role;

  SystemMessageType = SystemMessageType;
  passwordUpdateProcessing = false;
  socialConnections: Array<SocialConnection> = [];
  socialProviders: Array<string> = [];
  showEmailChangeMessage: boolean = false;

  private readonly destroyed$ = new Subject<void>();

  constructor(public constants: Constants,
              public messages: Messages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              public dialog: MatDialog,
              public accountService: AccountService,
              public tricksService: TricksService,
              public popupService: PopUpMessageService,
              private socialConnectionService: SocialConnectionsService,
              private socialAuthService: AuthService) {
    this.getUserAccount();
    this.socialProviders = enumToArrayList(SocialConnection.Provider);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }


  getUserAccount() {
    this.accountService
      .getAccount(this.securityService.getLoginModel().id)
      .subscribe(
        account => {
          this.account = account;
          this.currentEmail = account.email;
        },
        err => {
          console.log(err);
        }
      );
    this.socialConnectionService.getConnections().subscribe(
      (socialConnections: Array<SocialConnection>) => {
        this.socialConnections = socialConnections;
      },
      err => {
        console.log(err);
      }
    );
  }

  updateUserInfo(form: NgForm): void {
    const formHasChanges = Object.values(form.controls).some(control => control.dirty || control.touched);
    if (formHasChanges) {
      this.accountService
        .updateAccount(this.securityService.getLoginModel().id, this.account)
        .subscribe(
          response => {
            this.popupService.showSuccess('User details is updated!');
            this.securityService.getCurrentUser();
            Object.values(form.controls).forEach(control => {
              control.markAsPristine();
            });
          },
          err => {
            console.log(err);
            this.popupService.showError(getErrorMessage(err));
          }
        );
      if (this.currentEmail != this.account.email) {
        this.account.email = this.currentEmail;
        this.emailEditDisabled = true;
        // this.changeEmailConfirm(true)
      }
    }
  }

  changeEmailConfirm() {
    if (this.currentEmail != this.account.email) {
      let properties = {
        title: 'Please confirm email change',
        message: '',
        OK: 'Confirm',
        CANCEL: 'Cancel'
      };
      this.confirmDialogRef = this.dialog.open(dialogsMap['email-confirm-dialog'], confirmDialogConfig);
      this.confirmDialogRef.componentInstance.email = this.account.email;
      this.confirmDialogRef.componentInstance.account = this.account;
      this.confirmDialogRef
        .afterClosed()
        .subscribe(result => {
          this.confirmDialogRef = null;
        });
      this.confirmDialogRef.componentInstance.properties = properties;

      this.confirmDialogRef.componentInstance.onSuccess.subscribe(
        email => {
          this.currentEmail = email;
          this.showEmailChangeMessage = true;
        });
      this.confirmDialogRef.componentInstance.onCancel.subscribe(
        () => {
          this.account.email = this.currentEmail;
        }
      );

    }

    this.emailEditDisabled = true;

  }

  changePassword(form: NgForm) {
    this.passwordUpdateProcessing = true;
    let oldNewValue: OldNewValue = {oldValue: this.oldNewPassword.password, newValue: this.oldNewPassword.newPassword};
    this.accountService
      .changePassword(oldNewValue)
      .subscribe(
        response => {
          this.popupService.showSuccess('Your password has been changed successfully!');
          form.resetForm();
          this.passwordUpdateProcessing = false;
        },
        err => {
          this.popupService.showError(getErrorMessage(err));
          this.passwordUpdateProcessing = false;
        }
      );
  }

  openDialogPhoto(): void {
    this.dialog.closeAll();
    this.photoDialogRef = this.dialog.open(dialogsMap['account-edit-photo-dialog'], personalPhotoDialogConfig);
    this.photoDialogRef.componentInstance.originalImage = this.securityService.getLoginModel().iconUrl;
    this.photoDialogRef.componentInstance.onPhotoReady.pipe(
      switchMap(
        (base64: string) => {
          return this.accountService.updateIconBase64(base64);
        }
      )
    ).subscribe(
      res => {
        this.setUserIconUrl(res.body);
      },
      err => this.popupService.showError(getErrorMessage(err)));
  }

  onEmailChangeMessageHide(event) {
    this.showEmailChangeMessage = event;
  }

  deleteAccountImage(): void {
    this.accountService.deleteIcon().subscribe(
      () => {
        this.setUserIconUrl(null);
        this.popupService.showSuccess('Account icon has been deleted');
      }, err => {
        console.log(err);
      });
  }

  deleteAccount(event: MouseEvent): void {
    event.stopPropagation();
    this.deleteAccountDialogRef = this.dialog.open(dialogsMap['delete-account-dialog'], completeProjectDialogConfig);
    this.deleteAccountDialogRef.componentInstance.account = this.account;
  }

  connectSocial(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform == SocialConnection.Provider.FACEBOOK) {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (socialPlatform == SocialConnection.Provider.GOOGLE) {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }
    from(this.socialAuthService.signIn(socialPlatformProvider))
      .pipe(
        switchMap(socialUser => this.processSocialConnect(socialUser)),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.popupService.showSuccess(`${capitalize(socialPlatform)} account has been connected`);
        this.getUserAccount();
      }, err => {
        this.popupService.showError(getErrorMessage(err));
      });
  }

  disconnectSocial(socialPlatform: string): void {
    let observable;
    let properties = {
      title: 'Confirm disconnecting social network',
      message: `Are you sure that you want to disconnect ${capitalize(socialPlatform)}?`,
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef.afterClosed().subscribe(result => this.confirmDialogRef = null);
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      res => {
        if (socialPlatform == SocialConnection.Provider.FACEBOOK) {
          observable = this.socialConnectionService.disconnectFacebook();
        } else {
          observable = this.socialConnectionService.disconnectGoogle();
        }
        observable.subscribe(res => {
          this.popupService.showSuccess(`${capitalize(socialPlatform)} account has been disconnected`);
          this.getUserAccount();
        }, err => {
          this.popupService.showError(getErrorMessage(err));
        });
      }
    );
  }

  socialConnected(provider: string): boolean {
    return this.socialConnections.some(connection => connection.provider == provider);
  }


  private setUserIconUrl(iconUrl: string) {
    this.account.iconUrl = iconUrl;
    this.securityService.getCurrentUser();
  }

  private processSocialConnect(socialUser: SocialUser): Observable<unknown> {
    switch (socialUser.provider) {
      case 'FACEBOOK': {
        return this.socialConnectionService.connectFacebook(socialUser.authToken);
      }
      case 'GOOGLE': {
        return this.socialConnectionService.connectGoogle(socialUser.idToken);
      }
      default: {
        console.error('Please provide a correct social platform');
        return throwError('Please provide a correct social platform');
      }
    }
  }
}
