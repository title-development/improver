import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SecurityService } from '../../../../auth/security.service';
import { BillingService } from '../../../../api/services/billing.service';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { confirmDialogConfig } from '../../../../shared/dialogs/dialogs.configs';


import { ActivatedRoute } from '@angular/router';
import { LeadsReport } from '../../../../api/models/LeadsReport';
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';

export enum SubscriptionState {
  SUBSCRIBED = 'SUBSCRIBED',
  NOT_SUBSCRIBED = 'NOT_SUBSCRIBED'
}

@Component({
  selector: 'dashboard-subscription',
  templateUrl: './dashboard-subscriptions.component.html',
  styleUrls: ['./dashboard-subscriptions.component.scss']
})
export class DashboardSubscriptionsComponent implements OnInit, OnChanges {

  subscriptionState = SubscriptionState;
  subscribe: boolean = false;
  state: SubscriptionState = SubscriptionState.NOT_SUBSCRIBED;
  subscriptionDialog: MatDialogRef<any>;
  @Input() leadsReport: LeadsReport;

  /**
   * Tooltip
   */
  tooltipShow: boolean;
  tooltipPositionLeft: string;
  subscriptionValue: number = 0;

  constructor(private billingService: BillingService,
              private securityService: SecurityService,
              private popupService: PopUpMessageService,
              private dialog: MatDialog,
              private route: ActivatedRoute) {
  }

  subscribeNow(): void {
    this.dialog.closeAll();
    this.subscriptionDialog = this.dialog.open(dialogsMap['subscription-dialog'], confirmDialogConfig);
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes): void {
    if (changes.leadsReport && changes.leadsReport.currentValue) {
      if (this.leadsReport.current.subscriptionAmount) {
        this.state = SubscriptionState.SUBSCRIBED;
        this.subscriptionValue = this.updateProgress(this.leadsReport.current);
      } else {
        this.state = SubscriptionState.NOT_SUBSCRIBED;
      }
    }
  }

  updateProgress(currentMonth): number {
    const progress = Math.ceil((100 * currentMonth.subscriptionSpend) / currentMonth.subscriptionAmount);

    return progress >= currentMonth.subscriptionAmount ? currentMonth.subscriptionAmount : progress;
  }

  showTooltip(event: Event): void {
    this.tooltipShow = true;
    const progressWidth = (event.target as HTMLElement).style.width;
    if (parseInt(progressWidth) > 92) {
      this.tooltipPositionLeft = '93%';
    } else if (parseInt(progressWidth) < 6) {
      this.tooltipPositionLeft = '6%';
    } else {
      this.tooltipPositionLeft = progressWidth;
    }

  }

  hideTooltip(event: Event): void {
    this.tooltipShow = false;
  }

}
