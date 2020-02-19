import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'subscription-dialog',
  templateUrl: './subscription-dialog.component.html',
  styleUrls: ['./subscription-dialog.component.scss']
})
export class SubscriptionDialogComponent {
  constructor(public currentDialogRef: MatDialogRef<SubscriptionDialogComponent>) {
  }

  close() {
    this.currentDialogRef.close();
  }
}
