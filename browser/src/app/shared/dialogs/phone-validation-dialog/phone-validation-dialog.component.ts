import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material";

@Component({
  selector: 'phone-validation-dialog',
  templateUrl: './phone-validation-dialog.component.html',
  styleUrls: ['./phone-validation-dialog.component.scss']
})

export class PhoneValidationDialogComponent implements OnInit {

  phoneNumber;
  onSuccess :EventEmitter<any> = new EventEmitter<boolean>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog) {
  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }

  success() {
    this.close();
    this.onSuccess.emit();
  }

}
