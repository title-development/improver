import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { NgForm } from "@angular/forms";
import { QuestionaryControlService } from "../../../api/services/questionary-control.service";
import { SecurityService } from "../../../auth/security.service";
import { Role } from "../../../model/security-model";
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { AccountService } from '../../../api/services/account.service';
import { ComponentCanDeactivate } from "../../../auth/router-guards/component-can-deactivate.guard";
import { NavigationHelper } from "../../../util/helpers/navigation-helper";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { ProjectActionService } from "../../../api/services/project-action.service";
import { dialogsMap } from "../dialogs.state";
import { confirmDialogConfig } from "../dialogs.configs";

@Component({
  selector: 'questionary-dialog',
  templateUrl: './questionary-dialog.component.html',
  styleUrls: ['./questionary-dialog.component.scss']
})

export class QuestionaryDialogComponent implements OnInit, ComponentCanDeactivate {

  companyId: string;
  model = {};

  constructor(private accountService: AccountService,
              public projectActionService: ProjectActionService,
              public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
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
            console.error(err);
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
    if (!this.projectActionService.zipIsSupported) {
      this.currentDialogRef.close();
    } else {
      let properties = {
        title: 'Unsaved changes',
        message: `You have unsaved project request. Are you sure you want to leave now?`,
        OK: 'Stay',
        CANCEL: 'Leave'
      };
      let confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
      confirmDialogRef
        .afterClosed()
        .subscribe(result => {
          confirmDialogRef = null;
        });
      confirmDialogRef.componentInstance.properties = properties as any;
      confirmDialogRef.componentInstance.onAction.subscribe(
        confirmed => {
          if (!confirmed) {
            this.currentDialogRef.close();
          }
        }
      );

    }
  }

  checkProgressBarWidth() {
    return (this.questionaryControlService.currentQuestionIndex + this.questionaryControlService.PRE_QUESTIONARY_LENGTH) / this.questionaryControlService.totalQuestionaryLength * 100 + '%'
  }

  canDeactivate(): boolean {
    return false;
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

}
