import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";

@Component({
  selector: 'company-name-edit-dialog',
  templateUrl: './company-name-edit-dialog.component.html',
  styleUrls: ['./company-name-edit-dialog.component.scss']
})
export class CompanyNameEditDialogComponent implements OnInit {

  value;
	onCancel: EventEmitter<any> = new EventEmitter<any>();
	onSuccess: EventEmitter<any> = new EventEmitter<any>();
	done = false;
	loading = false;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public popUpMessageService: PopUpMessageService) { }

  ngOnInit(): void {
  }

  close() {
    this.currentDialogRef.close();
    this.onCancel.emit();
  }

  saveChanges() {
    this.loading = true;
    this.onSuccess.emit(this.value)
	}

}
