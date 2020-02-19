import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'phone-validation-dialog',
  templateUrl: './phone-validation-dialog.component.html',
  styleUrls: ['./phone-validation-dialog.component.scss']
})

export class PhoneValidationDialogComponent implements OnInit {

  showEditButton = false;
  phoneNumber;
  onSuccess :EventEmitter<any> = new EventEmitter<boolean>();
  onManualClose :EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  close(isManual: boolean = true) {
    this.currentDialogRef.close();
    if(isManual) {
      this.onManualClose.emit()
    }
  }

  success() {
    this.close(false);
    this.onSuccess.emit();
  }

}
