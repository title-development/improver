import { Component } from '@angular/core';
import { Constants } from '../../../util/constants';
import { TextMessages } from '../../../util/text-messages';
import { UserService } from '../../../api/services/user.service';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { getErrorMessage } from '../../../util/functions';
import { NgForm } from '@angular/forms';
import { Role } from '../../../model/security-model';

@Component({
  selector: 'delete-company-dialog',
  templateUrl: './delete-company-dialog.component.html',
  styleUrls: ['./delete-company-dialog.component.scss']
})
export class DeleteCompanyDialogComponent {
  password: string;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public constants: Constants,
              public messages: TextMessages,
              private companyService: CompanyService,
              private popupService: PopUpMessageService) {
  }

  close() {
    this.currentDialogRef.close();
  }

  deleteCompany(form: NgForm): void {
    if(form.valid) {
      this.companyService.deleteCompany(this.password).subscribe(
        res => {
          this.popupService.showSuccess('Company has been deleted');
          this.currentDialogRef.close();
          this.securityService.logout();
        },
        err => {
          this.popupService.showError(getErrorMessage(err));
        }
      );
    }
  }
}
