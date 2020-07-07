import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { SecurityService } from '../../../auth/security.service';

@Component({
  selector: 'email-verification-hint-dialog',
  templateUrl: './email-verification-hint-dialog.component.html',
  styleUrls: ['./email-verification-hint-dialog.component.scss']
})

export class EmailVerificationHintDialogComponent implements OnInit {

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService) {
  }

  ngOnInit() {
  }

  close() {
    this.currentDialogRef.close();
  }

}





