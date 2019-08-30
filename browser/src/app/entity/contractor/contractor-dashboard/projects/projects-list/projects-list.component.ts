import { Component, Input } from '@angular/core';
import { ContractorProjectShort } from '../../../../../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { completeProjectDialogConfig } from '../../../../../shared/dialogs/dialogs.configs';
import { dialogsMap } from '../../../../../shared/dialogs/dialogs.state';
import { ProjectRequest } from "../../../../../api/models/ProjectRequest";
import { PopUpMessageService } from "../../../../../util/pop-up-message.service";
import { ProjectRequestService } from "../../../../../api/services/project-request.service";
import { ProjectActionService } from "../../../../../util/project-action.service";

@Component({
  selector: 'projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
})

export class ProjectsListComponent {
  @Input() list: Array<ContractorProjectShort>;
  refundDialog: MatDialogRef<any>;
  ProjectRequest = ProjectRequest;

  constructor(public dialog: MatDialog,
              public popUpService: PopUpMessageService,
              public projectRequestService: ProjectRequestService,
              public projectActionService: ProjectActionService) {
  }

  openRequestRefundDialog(project: ContractorProjectShort): void {
    this.dialog.closeAll();
    this.refundDialog = this.dialog.open(dialogsMap["request-refund-dialog"], completeProjectDialogConfig);
    this.refundDialog
      .afterClosed()
      .subscribe(result => {
        this.refundDialog = null;
      });
    this.refundDialog.componentInstance.project = project;
    this.refundDialog.componentInstance.onDone.subscribe(() => {
      this.list.forEach(item => {
        if (item.id == project.id) {
          item.status = ProjectRequest.Status.REFUND_REQUESTED;
          item.refundRequested = true;
          item.refundable = false;
        }
      })
    })
  }

  openRefundStatusDialog(project): void {
    this.dialog.closeAll();
    this.refundDialog = this.dialog.open(dialogsMap["refund-status-dialog"], completeProjectDialogConfig);
    this.refundDialog
      .afterClosed()
      .subscribe(result => {
        this.refundDialog = null;
      });
    this.refundDialog.componentInstance.project = project;
  }

  unreadMessagesTittle(count: number): string {
    if(count > 1) {
      return `You have ${count} new messages`
    } else {
      return `You have ${count} new message`
    }
  }

}
