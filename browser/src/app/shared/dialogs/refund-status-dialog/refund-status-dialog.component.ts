import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ContractorProject, ContractorProjectShort } from "../../../model/data-model";
import { MatDialogRef } from "@angular/material/dialog";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { ProjectService } from "../../../api/services/project.service";
import { NgForm } from "@angular/forms";
import { Refund } from "../../../api/models/Refund";
import { getErrorMessage } from "../../../util/functions";
import { ProjectRequest } from "../../../api/models/ProjectRequest";

@Component({
  selector: 'refund-status-dialog',
  templateUrl: './refund-status-dialog.component.html',
  styleUrls: ['./refund-status-dialog.component.scss']
})
export class RefundStatusDialogComponent implements OnInit {

  project: ContractorProjectShort;
  refundResult: Refund.Result = {};
  refundResultProcessing = true;
  refundStatus = Refund.Status;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public popUpService: PopUpMessageService,
              public projectService: ProjectService) {
  }

  ngOnInit() {
    this.getRefundResult();
  }

  getRefundResult() {
    this.refundResultProcessing = true;
    this.projectService.getRefundResult(this.project.id)
      .subscribe(
        refundResult => {
          console.log(this.refundResult);
          this.refundResult = refundResult;
          this.refundResultProcessing = false;
        },
        err => {
          console.log(err);
          this.refundResultProcessing = false;
        }
      );
  }

  close() {
    this.currentDialogRef.close();
  }

  onSubmit(form) {
    console.log(form);
  }



}
