import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialogRef } from "@angular/material/dialog";
import { Constants } from "../../../util/constants";
import { Messages } from "../../../util/messages";
import { NgForm } from "@angular/forms";

@Component({
  selector: 'password-editor',
  templateUrl: './password-editor.component.html',
  styleUrls: ['./password-editor.component.scss']
})
export class PasswordEditorComponent implements OnInit {

  properties = {
    title: 'Please confirm this actions',
		oldNewPassword: {
			oldPassword: '',
			newPassword: '',
			confirmNewPassword: ''
		},
		passwordUpdateProcessing: false
  };
  onCancel: EventEmitter<any> = new EventEmitter<any>();
  onSuccess: EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
							public constants: Constants,
							public messages: Messages) { }

  ngOnInit(): void {
  }

  close(form?: NgForm) {
    this.currentDialogRef.close();
    this.onCancel.emit();
    if (form) {
			form.reset();
		}
  }

  saveChanges(form: NgForm) {
  	if (form.valid){
			this.onSuccess.emit();
		}
  }

}
