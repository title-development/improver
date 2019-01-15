import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CvDateRangePicker } from '../../../theme/date-range-picker/cv-date-range-picker/cv-date-range-picker.component';
import { UnavailabilityPeriod } from '../../../api/models/UnavailabilityPeriod';
import { TricksService } from '../../../util/tricks.service';

@Component({
  selector: 'unavailability-period',
  templateUrl: './unavailability-period-dialog.component.html',
  styleUrls: ['./unavailability-period-dialog.component.scss']
})
export class UnavailabilityPeriodDialogComponent implements OnInit {
  update$: EventEmitter<UnavailabilityPeriod> = new EventEmitter<UnavailabilityPeriod>();
  buttonTitle: string;
  reasons;
  reason: string;
  range: CvDateRangePicker;
  unavailabilityPeriod: UnavailabilityPeriod = new UnavailabilityPeriod();
  minDate: Date = new Date();
  maxDate: Date = new Date();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              private trickService: TricksService) {
    this.reasons = this.trickService.enumToJson(UnavailabilityPeriod.Reason);
    this.maxDate.setMonth(this.maxDate.getMonth() + 7);
  }

  ngOnInit(): void {
    this.buttonTitle = this.unavailabilityPeriod.id ? 'Update': 'Add';
    this.reason = this.unavailabilityPeriod.reason;
    if(this.unavailabilityPeriod.fromDate && this.unavailabilityPeriod.tillDate) {
      this.range = new CvDateRangePicker(this.unavailabilityPeriod.fromDate, this.unavailabilityPeriod.tillDate);
    }
  }

  selectedReason(reason: string): void {
  }

  save() {
    this.unavailabilityPeriod.reason = this.reason;
    this.unavailabilityPeriod.fromDate = this.range.from;
    this.unavailabilityPeriod.tillDate = this.range.till;
    this.update$.emit(this.unavailabilityPeriod);
    this.close();
  }

  close() {
    this.currentDialogRef.close();
  }
}
