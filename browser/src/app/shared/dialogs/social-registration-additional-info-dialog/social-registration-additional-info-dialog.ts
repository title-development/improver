import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { AdditionalUserInfo } from '../../../model/security-model';
import { Subject } from 'rxjs';

@Component({
  selector: 'social-registration-additional-info-dialog',
  templateUrl: './social-registration-additional-info-dialog.html',
  styleUrls: ['./social-registration-additional-info-dialog.scss']
})
export class SocialRegistrationAdditionalInfoDialog implements OnDestroy {
  @Input()
  emailMissing = false;
  @Input()
  phoneMissing = false;
  @Input()
  userName = 'user';
  @Input()
  socialPlatform = 'social platform';
  @Output()
  onSuccess = new EventEmitter<AdditionalUserInfo>();

  additionalUserInfo: AdditionalUserInfo = {
    phone: null,
    email: null
  };

  showMessage: boolean = false;
  messageType: string;
  messageText: string;
  processing: boolean = false;
  phoneValidating: boolean = false;
  private readonly destroyed$ = new Subject<void>();

  constructor(public messages: Messages,
              public currentDialogRef: MatDialogRef<any>,
              public constants: Constants) {
  }

  validatePhone() {
    if (this.phoneMissing) {
      this.phoneValidating = true;
    } else {
      this.onSuccess.emit(this.additionalUserInfo);
    }
  }

  registerUser(): void {
    this.onSuccess.emit(this.additionalUserInfo);
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

}
