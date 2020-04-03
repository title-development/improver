import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ContractorProjectShort } from '../../../model/data-model';
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { ProjectService } from "../../../api/services/project.service";
import { NgForm } from "@angular/forms";
import { Refund } from "../../../api/models/Refund";
import { getErrorMessage } from "../../../util/functions";
import { ProjectActionService } from "../../../util/project-action.service";
import { MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'request-refund-dialog',
  templateUrl: './request-refund-dialog.component.html',
  styleUrls: ['./request-refund-dialog.component.scss']
})
export class RequestRefundDialogComponent implements OnInit {

  @Output()
  onDone: EventEmitter<any> = new EventEmitter<any>();

  project: ContractorProjectShort;
  questionary: Refund.Questionary;
  refundIssue: Refund.RefundIssue;
  questionaryProcessing = false;
  refundOptions = Refund.Option;

  refundRequest: Refund.Request = {};

  step = 1;
  zipRegExp = new RegExp('{zip}', 'gm');
  serviceNameRegExp = new RegExp('{serviceName}', 'gm');

  constructor(public currentDialogRef: MatDialogRef<any>,
              public popUpService: PopUpMessageService,
              public projectService: ProjectService,
              public projectActionsService: ProjectActionService) {

  }

  ngOnInit() {
    this.getRefundOptions();
  }

  getRefundOptions() {
    this.questionaryProcessing = true;
    this.projectService.getRefundOptions(this.project.id)
      .subscribe(
        questionary => {
          this.questionary = questionary;
          this.questionaryProcessing = false;
        },
        err => {
          console.error(err);
          this.questionaryProcessing = false;
        }
      );
  }

  close() {
    this.currentDialogRef.close();
  }

  submitIssue(form: NgForm) {

    if (this.refundRequest.issue == undefined) {
      form.controls.issue.markAsDirty();
      return;
    }

    this.refundIssue = this.questionary.issues.filter(item => item.name == this.refundRequest.issue)[0];
    this.step = 2;
  }

  onSubmit(form: NgForm) {

    if (this.refundRequest.option == undefined) {
      form.controls.option.markAsDirty();
      return;
    }

    if (this.refundRequest.option == Refund.Option.NEVER_WORK_IN_ZIP) {
      this.refundRequest.removeZip = true;
    } else if (this.refundRequest.option == Refund.Option.NEVER_DO_SERVICE || this.refundRequest.option == Refund.Option.NOT_EQUIPPED ) {
      this.refundRequest.removeService = true;
    }
    this.questionaryProcessing = true;
    this.projectService.requestRefund(this.project.id, this.refundRequest)
      .subscribe(
        refundResponse => {
          this.step = 3;
          this.questionaryProcessing = false;
          this.onDone.emit();
          this.projectActionsService.projectUpdated();
        },
        err => {
          this.questionaryProcessing = false;
          this.popUpService.showError(getErrorMessage(err))
        }
      );

  }


}
