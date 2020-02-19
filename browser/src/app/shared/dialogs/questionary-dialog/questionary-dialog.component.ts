import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ServiceType } from "../../../model/data-model";
import { NgForm } from "@angular/forms";
import { QuestionaryBlock } from "../../../model/questionary-model";
import { QuestionaryControlService } from "../../../util/questionary-control.service";
import { PhoneHelpService } from "../../../util/phone-help.service";
import { SecurityService } from "../../../auth/security.service";
import { Role } from "../../../model/security-model";
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { AccountService } from '../../../api/services/account.service';
import { ComponentCanDeactivate } from "../../../auth/router-guards/component-can-deactivate.guard";
import { NavigationHelper } from "../../../util/navigation-helper";
import { ServiceQuestionaryModel } from "../../../model/service-questionary-model";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'questionary-dialog',
  templateUrl: './questionary-dialog.component.html',
  styleUrls: ['./questionary-dialog.component.scss']
})

export class QuestionaryDialogComponent implements OnInit, ComponentCanDeactivate {

  companyId: string;
  model = {};

  constructor(private accountService: AccountService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public phoneHelpService: PhoneHelpService,
              public serviceTypeService: ServiceTypeService,
              public securityService: SecurityService,
              public questionaryControlService: QuestionaryControlService,
              public popUpService: PopUpMessageService,
              public navigationHelper: NavigationHelper) {

    if (securityService.hasRole(Role.CUSTOMER)) {
      this.accountService
        .getAccount(securityService.getLoginModel().id)
        .subscribe(
          account => {
            this.questionaryControlService.customerAccount = account;
          },
          err => {
            console.log(err);
          }
        );
    }

    this.navigationHelper.preventNativeBackButton();

  }

  ngOnInit() {
    this.questionaryControlService.initFormGroup()
  }

  onSubmit(questionaryForm: NgForm) {
  }

  close() {
    if (!this.questionaryControlService.showQuestionary
      || confirm('Do you want to exit? Service will not be requested. Press OK - to exit, Cancel to stay')) {
      this.currentDialogRef.close();
      this.phoneHelpService.showPartial();
    }
  }

  checkProgressBarWidth() {
    return (this.questionaryControlService.currentQuestionIndex + 1) / this.questionaryControlService.totalQuestionaryLength * 100 + '%'
  }

  canDeactivate(): boolean {
    return false;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

}
