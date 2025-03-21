import { Component, OnDestroy } from '@angular/core';
import { Constants } from '../../../../util/constants';
import { TextMessages } from '../../../../util/text-messages';
import { Account, OldNewValue, SystemMessageType } from '../../../../model/data-model';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../../../auth/security.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  completeProjectDialogConfig,
  confirmDialogConfig,
  passwordEditorDialogConfig,
  personalPhotoDialogConfig,
  phoneValidationDialogConfig
} from '../../../../shared/dialogs/dialogs.configs';
import { AccountService } from '../../../../api/services/account.service';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { enumToArrayList, TricksService } from '../../../../api/services/tricks.service';
import { Role } from '../../../../model/security-model';
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { NgForm } from '@angular/forms';
import { applyPhoneMask, capitalize, getErrorMessage, removePhoneMask } from '../../../../util/functions';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { SocialLoginService } from '../../../../api/services/social-login.service';
import { SocialConnection } from '../../../../api/models/SocialConnection';
import { from, Observable, Subject, throwError } from 'rxjs';
import { MediaQuery, MediaQueryService } from "../../../../api/services/media-query.service";
import { CompanyService } from "../../../../api/services/company.service";
import { CompanyInfoService } from "../../../../api/services/company-info.service";
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser
} from "../../../../auth/social-login/public-api";


@Component({
  selector: 'personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})

export class PersonalInfoComponent implements OnDestroy {

  account: Account;
  newEmail: string;
  accountPhone: string;
  companyIconUrl: string;
  confirmDialogRef: MatDialogRef<any>;
  photoDialogRef: MatDialogRef<any>;
  deleteAccountDialogRef: MatDialogRef<any>;
  passwordEditorDialogRef: MatDialogRef<any>;

  currentEmail: string;
  currentPhone: string;

  oldNewPassword = {
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  };

  Role = Role;

  SystemMessageType = SystemMessageType;
  passwordUpdateProcessing = false;
  socialConnections: Array<SocialConnection> = [];
  socialProviders: Array<string> = [];
  showEmailChangeMessage: boolean = false;
  mediaQuery: MediaQuery;

  private readonly destroyed$ = new Subject<void>();

  constructor(public constants: Constants,
              public messages: TextMessages,
              public route: ActivatedRoute,
              public securityService: SecurityService,
              public dialog: MatDialog,
              public accountService: AccountService,
              public tricksService: TricksService,
              public popupService: PopUpMessageService,
              public companyInfoService: CompanyInfoService,
              private companyService: CompanyService,
              private mediaQueryService: MediaQueryService,
              private socialConnectionService: SocialLoginService,
              private socialAuthService: SocialAuthService) {
    this.getUserAccount();
    this.subscribeForMediaQuery();
    if (this.securityService.hasRole(Role.CONTRACTOR)){
      this.getCompanyIcon();
    }
    this.socialProviders = enumToArrayList(SocialConnection.Provider);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openPasswordEditor() {
    this.dialog.closeAll();
    this.passwordEditorDialogRef = this.dialog.open(dialogsMap['password-editor-dialog'], passwordEditorDialogConfig);
    this.passwordEditorDialogRef
        .afterClosed()
        .subscribe(result => {
          this.passwordEditorDialogRef = null;
        });
    let properties = {
      title: 'Change password',
      oldNewPassword: this.oldNewPassword,
      passwordUpdateProcessing: this.passwordUpdateProcessing
    };
    this.passwordEditorDialogRef.componentInstance.properties = properties;
    this.passwordEditorDialogRef.componentInstance.onSuccess.subscribe(() => {
      this.oldNewPassword = this.passwordEditorDialogRef.componentInstance.properties.oldNewPassword;
      this.changePassword();
    });
  }

  subscribeForMediaQuery(){
    this.mediaQueryService.screen
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });
  }


  getUserAccount() {
    this.accountService
      .getAccount(this.securityService.getLoginModel().id)
      .subscribe(
        account => {
          this.account = account;
          this.newEmail = this.currentEmail = account.email;
          this.accountPhone = this.currentPhone = this.account.phone = account.phone ? applyPhoneMask(account.phone) : "";
          this.setUserIconUrl(this.account.iconUrl);
        },
        err => {
          console.error(err);
        }
      );
    this.socialConnectionService.getConnections().subscribe(
      (socialConnections: Array<SocialConnection>) => {
        this.socialConnections = socialConnections;
      },
      err => {
        console.error(err);
      }
    );
  }

  getCompanyIcon() {
    this.companyService.get(this.securityService.getLoginModel().company)
        .subscribe(
          companyProfile => {
            this.companyIconUrl = companyProfile.iconUrl;
            this.setCompanyIconUrl(this.companyIconUrl);
          },
          err => {
            console.error(err);
          });
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
            console.error(err);
            this.popupService.showError(getErrorMessage(err));
          }
        );
    }
  }

  changeEmailConfirm(value) {
    if (this.currentEmail != this.newEmail) {
      let properties = {
        title: 'Please confirm email change',
        message: '',
        OK: 'Confirm',
        CANCEL: 'Cancel'
      };
      this.confirmDialogRef = this.dialog.open(dialogsMap['email-confirm-dialog'], confirmDialogConfig);
      this.confirmDialogRef.componentInstance.email = this.newEmail;
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
          this.newEmail = this.account.email = this.currentEmail;
        }
      );
    }
  }

  changePhoneConfirm(value) {
    if (this.currentPhone != this.accountPhone) {
      this.confirmDialogRef = this.dialog.open(dialogsMap['phone-validation-dialog'], phoneValidationDialogConfig);
      this.confirmDialogRef
        .afterClosed()
        .subscribe(result => {
          this.confirmDialogRef = null;
        });
      let unmaskedPhone = removePhoneMask(this.accountPhone);
      this.confirmDialogRef.componentInstance.phoneNumber = unmaskedPhone;
      this.confirmDialogRef.componentInstance.onSuccess
        .pipe(takeUntil(this.confirmDialogRef.afterClosed()))
        .subscribe(() => {
          this.accountService.changePhone(unmaskedPhone)
            .subscribe(() => {
                this.currentPhone = this.accountPhone;
                this.popupService.showSuccess("Your phone number updated successfully")
              },
              err => this.popupService.showError(getErrorMessage(err)));
        });

      this.confirmDialogRef.componentInstance.onManualClose
        .pipe(takeUntil(this.confirmDialogRef.afterClosed()))
        .subscribe(() => {
          this.accountPhone = this.currentPhone;
        });
    }
  }

  changePassword() {
    this.passwordUpdateProcessing = true;
    this.passwordEditorDialogRef.componentInstance.properties.passwordUpdateProcessing = this.passwordUpdateProcessing;
    let oldNewValue: OldNewValue = {oldValue: this.oldNewPassword.oldPassword, newValue: this.oldNewPassword.newPassword};
    this.accountService
      .changePassword(oldNewValue)
      .pipe(finalize(()=> {
        this.passwordUpdateProcessing = false;
        this.passwordEditorDialogRef.componentInstance.properties.passwordUpdateProcessing = this.passwordUpdateProcessing;
      }))
      .subscribe(
        response => {
          this.popupService.showSuccess('Your password has been changed successfully!');
          this.dialog.closeAll();
					this.oldNewPassword.oldPassword = null;
					this.oldNewPassword.newPassword = null;
					this.oldNewPassword.confirmNewPassword = null;
        },
        err => {
          this.popupService.showError(getErrorMessage(err));
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
          if (this.securityService.hasRole(Role.CONTRACTOR)){
            return this.companyService.updateLogo(this.securityService.getLoginModel().company, base64);
          }
          return this.accountService.updateIconBase64(base64);
        }
      )
    ).subscribe(
      res => {
        if (this.securityService.hasRole(Role.CONTRACTOR)) {
          this.setCompanyIconUrl(res.body);
        } else {
          this.setUserIconUrl(res.body);
        }
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
        console.error(err);
      });
  }

  deleteAccount(event: MouseEvent): void {
    event.stopPropagation();
    if (this.securityService.hasRole(Role.CONTRACTOR)) {
      this.dialog.open(dialogsMap['delete-company-dialog'], completeProjectDialogConfig);
    } else {
      this.deleteAccountDialogRef = this.dialog.open(dialogsMap['delete-account-dialog'], completeProjectDialogConfig);
      this.deleteAccountDialogRef.componentInstance.account = this.account;
  }
  }

  connectSocial(socialPlatform: string) {
    let socialPlatformProvider;
    if (socialPlatform == SocialConnection.Provider.FACEBOOK) {
      socialPlatformProvider = FacebookLoginProvider.PROVIDER_ID;
    } else if (socialPlatform == SocialConnection.Provider.GOOGLE) {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    let socialProvider = this.socialAuthService.getProvider(socialPlatformProvider)

    from(socialProvider.getProfile())
      .pipe(
        switchMap(socialUser => this.processSocialConnect(socialUser)),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.popupService.showSuccess(`${capitalize(socialPlatform)} account has been connected`);
        this.getUserAccount();
        if (this.securityService.hasRole(Role.CONTRACTOR)){
          this.getCompanyIcon();
        }
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
        } else if (socialPlatform == SocialConnection.Provider.GOOGLE) {
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

  private setCompanyIconUrl(iconUrl: string) {
    this.companyIconUrl = iconUrl;
    this.securityService.getCurrentUser();
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
