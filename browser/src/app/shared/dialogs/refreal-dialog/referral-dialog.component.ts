import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { ReferralService } from '../../../api/services/referral.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../util/functions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { IClipboardResponse } from "ngx-clipboard";

@Component({
  selector: 'referral-dialog',
  templateUrl: './referral-dialog.component.html',
  styleUrls: ['./referral-dialog.component.scss']
})
export class ReferralDialogComponent implements OnInit, OnDestroy {

  readonly EMAIL_CLIENT_OPENING_TIMEOUT = 3000;
  recipientEmail;
  mailTo: string = '';
  referralCode;
  referralUrl: string;
  fetching: boolean = true;
  private readonly mailNewLineBreak: string = '%0D%0A'; //valid mailto new line break
  private componentDestroyed: Subject<any> = new Subject();
  emailClientOpening = false;


  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private referralService: ReferralService,
              private popUpService: PopUpMessageService,
              @Inject('Window') private window: Window) {
    this.referralService.getReferralCode().pipe(takeUntil(this.componentDestroyed)).subscribe((referralCode: string) => {
      this.fetching = false;
      if (referralCode) {
        this.referralCode = referralCode;
        this.referralUrl = `${location.origin}/signup-pro?referer=${referralCode}`;
      } else {
        this.popUpService.showError('Referral code is is unavailable. Please, contact customer support.');
      }
    }, err => {
      console.error(err);
      this.popUpService.showError(getErrorMessage(err));
      this.fetching = false;
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.componentDestroyed.next();
    this.componentDestroyed.complete();
  }

  close() {
    this.currentDialogRef.close();
  }

  sendLinkVieEmail() {
    if (this.referralCode) {
      this.emailClientOpening = true;
      this.mailTo = this.generateMailTo(this.recipientEmail, this.referralUrl, this.constants.REFERRAL_BONUS_AMOUNT / 100, this.securityService.getLoginModel().name);
      this.window.open(this.mailTo, '_top')
      setTimeout(() => { this.emailClientOpening = false; }, this.EMAIL_CLIENT_OPENING_TIMEOUT)
    } else {
      this.popUpService.showError('Referral code is is unavailable. Please, contact customer support.');
    }
  }

  shareByFacebook(): void {
    this.popUpService.showError('Method not implemented');
  }

  private generateMailTo(recipient: string = '', referralUrl: string, bonusAmount: number, companyName: string): string {
    const subject = `Get $${bonusAmount} when you join ${companyName} on Home Improve.`;
    const body = `Check out Home Improve - it’s a place where you can easily find new clients to grow your business${this.mailNewLineBreak}${this.mailNewLineBreak}`
      + `You can join me here: ${referralUrl}${this.mailNewLineBreak}${this.mailNewLineBreak}`
      + `${companyName}${this.mailNewLineBreak}${this.mailNewLineBreak}`;

    return `mailto:${recipient}?subject=${subject}&body=${body}`;
  }

  referralLinkCopied($event: IClipboardResponse) {
    this.popUpService.showSuccess('Your code copied')
  }
}
