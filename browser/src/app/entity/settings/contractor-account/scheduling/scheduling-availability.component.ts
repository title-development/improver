import { Component, EventEmitter, OnDestroy } from '@angular/core';
import { UnavailabilityPeriodService } from '../../../../api/services/unavailability-period.service';
import { SecurityService } from '../../../../auth/security.service';
import { UnavailabilityPeriod } from '../../../../api/models/UnavailabilityPeriod';

import { eachDay, format, getOverlappingDaysInRanges, getTime } from 'date-fns';
import { MatDialog, MatDialogRef } from '@angular/material';
import { dialogsMap } from '../../../../shared/dialogs/dialogs.state';
import { confirmDialogConfig, unavailabilityPeriodDialogConfig } from '../../../../shared/dialogs/dialogs.configs';
import { Subscription } from 'rxjs';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';
import { first } from "rxjs/internal/operators";

@Component({
  selector: 'scheduling-availability',
  templateUrl: './scheduling-availability.component.html',
  styleUrls: ['./scheduling-availability.component.scss']
})
export class SchedulingAvailabilityComponent implements OnDestroy {

  periods: Array<UnavailabilityPeriod>;
  unavailabilityPeriodDialogRef: MatDialogRef<any>;
  confirmDialogRef: MatDialogRef<any>;
  Reason = UnavailabilityPeriod.Reason;
  fetching: boolean = true;
  private update$: Subscription;

  constructor(private unavailabilityPeriodService: UnavailabilityPeriodService,
              private securityService: SecurityService,
              public dialog: MatDialog,
              private poPupService: PopUpMessageService) {
    this.getPeriods();
  }

  unavailableDays(unavailabilityPeriod: UnavailabilityPeriod): number {
    const from = getTime(unavailabilityPeriod.fromDate);
    const till = getTime(unavailabilityPeriod.tillDate);
    if (from > till) {
      return eachDay(new Date(unavailabilityPeriod.tillDate), new Date(unavailabilityPeriod.fromDate)).length;
    } else {
      return eachDay(new Date(unavailabilityPeriod.fromDate), new Date(unavailabilityPeriod.tillDate)).length;
    }
  }

  addEdit(unavailabilityPeriod: UnavailabilityPeriod = null): void {
    this.unavailabilityPeriodDialogRef = this.dialog.open(dialogsMap['unavailability-period-dialog'], unavailabilityPeriodDialogConfig);
    if (unavailabilityPeriod) {
      this.unavailabilityPeriodDialogRef.componentInstance.unavailabilityPeriod = unavailabilityPeriod;
    }
    this.update$ = this.unavailabilityPeriodDialogRef.componentInstance.update$.subscribe((unavailabilityPeriod: UnavailabilityPeriod) => {
      if (unavailabilityPeriod && unavailabilityPeriod.id) {
        this.unavailabilityPeriodService.update(unavailabilityPeriod.id, this.securityService.getLoginModel().company, unavailabilityPeriod).subscribe(res => {
          this.poPupService.showSuccess('Unavailability period has been updated');
          this.getPeriods();
        }, err => this.poPupService.showError(getErrorMessage(err)));
      } else {
        this.unavailabilityPeriodService.add(this.securityService.getLoginModel().company, unavailabilityPeriod).subscribe(res => {
          this.poPupService.showSuccess('Unavailability period has been created');
          this.getPeriods();
        }, err => this.poPupService.showError(getErrorMessage(err)));
      }
    });
  }

  delete(event, unavailabilityPeriod: UnavailabilityPeriod): void {
    event.stopPropagation();
    event.preventDefault();
    let properties = {
      title: 'Confirm removing Unavailability period',
      message: `Are you sure that you want to delete period ${format(new Date(unavailabilityPeriod.fromDate),'MMM D, YYYY')} - ${format(new Date(unavailabilityPeriod.tillDate), 'MMM D, YYYY')} ?`,
      OK: 'Confirm',
      CANCEL: 'Cancel'
    };
    this.confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
    this.confirmDialogRef
      .afterClosed()
      .subscribe(result => {
        this.confirmDialogRef = null;
      });
    this.confirmDialogRef.componentInstance.properties = properties;
    this.confirmDialogRef.componentInstance.object = unavailabilityPeriod.id;
    this.confirmDialogRef.componentInstance.onConfirm.subscribe(
      periodId => {
        this.unavailabilityPeriodService.delete(periodId, this.securityService.getLoginModel().company).subscribe(res => {
          this.poPupService.showSuccess('Unavailability period has been deleted');
          this.getPeriods();
        }, err => this.poPupService.showError(getErrorMessage(err)));
      }
    );
  }

  ngOnDestroy() {
    if (this.update$) {
      this.update$.unsubscribe();
    }
  }

  private getPeriods(): void {
    this.fetching = true;
    this.unavailabilityPeriodService.getAllByCompany(this.securityService.getLoginModel().company).pipe(
      first()
    ).subscribe((periods: Array<UnavailabilityPeriod>) => {
      this.fetching = false;
      this.periods = periods;
    });
  }
}
