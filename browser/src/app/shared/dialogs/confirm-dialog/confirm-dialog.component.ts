import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { SecurityService } from '../../../auth/security.service';

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})

export class ConfirmDialogComponent implements OnInit {

  properties = {
    title: "Please confirm this action",
    message: "",
    OK: "Confirm",
    CANCEL: "Cancel",
    confirmOnly: false,
    messageStyle: {}
  };

  object: any;
  onConfirm :EventEmitter<any> = new EventEmitter<boolean>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
             ) {
  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }

  confirm() {
    this.onConfirm.emit(this.object);
    this.currentDialogRef.close();
  }

}





