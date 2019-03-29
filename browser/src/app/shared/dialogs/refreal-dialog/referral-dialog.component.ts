import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { SecurityService } from '../../../auth/security.service';
import { Constants } from '../../../util/constants';
import { Messages } from '../../../util/messages';
import { ReferralService } from '../../../api/services/referral.service';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../util/functions';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'referral-dialog',
  templateUrl: './referral-dialog.component.html',
  styleUrls: ['./referral-dialog.component.scss']
})
export class ReferralDialogComponent implements OnInit, OnDestroy {

  mailTo: string = '';
  referralUrl: string;
  fetching: boolean = true;
  private readonly mailNewLineBreak: string = '%0D%0A'; //valid mailto new line break
  private componentDestroyed: Subject<any> = new Subject();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: Messages,
              private referralService: ReferralService,
              private popUpService: PopUpMessageService,) {
    this.referralService.getReferralCode().pipe(takeUntil(this.componentDestroyed)).subscribe((referralCode: string) => {
      this.fetching = false;
      if (referralCode) {
        this.referralUrl = `${location.origin}/signup-pro?referer=${referralCode}`;
        this.mailTo = this.generateMailTo(this.referralUrl, this.constants.REFERRAL_BONUS_AMOUNT / 100, this.securityService.getLoginModel().name);
      } else {
        this.popUpService.showError('Referral code not found');
      }
    }, err => {
      this.fetching = false;
      console.log(err);
      this.popUpService.showError(getErrorMessage(err));
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

  shareByFacebook(): void {
    this.popUpService.showError('Method not implemented');
  }

  private generateMailTo(referralUrl: string, bonusAmount: number, companyName: string): string {
    const subject = `Get $${bonusAmount} when you join ${companyName} on Home Improve.`;
    const body = `Check out Home Improve - it’s a place where you can easily find new clients to grow your business${this.mailNewLineBreak}${this.mailNewLineBreak}`
      + `You can join me here: ${referralUrl}${this.mailNewLineBreak}${this.mailNewLineBreak}`
      + `${companyName}${this.mailNewLineBreak}${this.mailNewLineBreak}`;

    return `mailto:?subject=${subject}&body=${body}`;
  }
}
