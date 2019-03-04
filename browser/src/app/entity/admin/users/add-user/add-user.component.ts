import { Component, ViewChild } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Role } from '../../../../model/security-model';
import { Constants } from '../../../../util/constants';
import { Messages } from '../../../../util/messages';
import { NgForm } from '@angular/forms';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';
import { StaffService } from "../../../../api/services/staff.service";

@Component({
  selector: 'add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent {
  roles: Array<SelectItem> = [
    {label: Role.SUPPORT, value: Role.SUPPORT},
    {label: Role.STAKEHOLDER, value: Role.STAKEHOLDER},
    {label: Role.MANAGER, value: Role.MANAGER}
  ];
  user = {
    email: '',
    role: Role.SUPPORT,
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  };
  @ViewChild('newUserForm') form: NgForm;

  constructor(public constants: Constants,
              public messages: Messages,
              private staffService: StaffService,
              private popUpService: PopUpMessageService,) {
  }

  addNewUser() {
    this.staffService.create(this.user).subscribe(
      () => this.popUpService.showSuccess('User has been created'),
      err => this.popUpService.showError(`Could not create user. ${getErrorMessage(err)}`));
    this.reset();
  }

  reset(): void {
    this.form.resetForm();
  }
}
