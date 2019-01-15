import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { LocationAddress } from '../../../api/models/LocationsValidation';

@Component({
  selector: 'location-suggest-dialog',
  templateUrl: './location-suggest-dialog.component.html',
  styleUrls: ['./location-suggest-dialog.component.scss']
})
export class LocationSuggestDialogDialog {

  typed: any;
  suggested: LocationAddress;
  validationMessage: string = '';
  locationVerified: EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog) {
  }

  save(data: any): void {
    this.currentDialogRef.close();
    this.locationVerified.next(data);
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}
