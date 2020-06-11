import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'company-info-editor',
  templateUrl: './company-info-editor.component.html',
  styleUrls: ['./company-info-editor.component.scss']
})
export class CompanyInfoEditorComponent implements OnInit {

	properties = {
		title: 'Please confirm this actions',
		placeholder: 'Type here...',
		value: ''
	};
	onCancel: EventEmitter<any> = new EventEmitter<any>();
	onSuccess: EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,) { }

  ngOnInit(): void {
  }

  close() {
    this.currentDialogRef.close();
    this.onCancel.emit();
  }

  saveChanges() {
  	this.onSuccess.emit()
	}

}
