import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { IInfoWindowDialogData } from './interfaces';

@Component({
  selector: 'info-window-dialog',
  templateUrl: './info-window-dialog.component.html',
  styleUrls: ['./info-window-dialog.component.scss']
})
export class InfoWindowDialogComponent {
  message: string;
  iconUrl: string;
  buttonTitle: string;

  private readonly destroyed$ = new Subject<void>();

  constructor(private dialogRef: MatDialogRef<InfoWindowDialogComponent>,
              @Inject(MAT_DIALOG_DATA) data: IInfoWindowDialogData,
              ) {
    this.message = data.message;
    this.iconUrl = data.iconUrl;
    this.buttonTitle = data.buttonTitle;
  }

  close() {
    this.dialogRef.close();
  }

}
