import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { SecurityService } from "../../../auth/security.service";
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';
import { ProjectRequestService } from "../../../api/services/project-request.service";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProjectRequest } from '../../../api/models/ProjectRequest';

@Component({
  selector: 'decline-contractor-dialog',
  templateUrl: './decline-contractor-dialog.component.html',
  styleUrls: ['./decline-contractor-dialog.component.scss']
})

export class DeclineContractorDialogComponent implements OnInit, OnDestroy {

  projectRequest: ProjectRequest;
  declineContractorVariants: any;
  reason: string;
  comment: string;
  onConfirm :EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public projectService: ProjectService,
              public projectRequestService: ProjectRequestService) {
  }

  ngOnInit() {
    this.getDeclineContractorVariants();
  }

  ngOnDestroy(): void {
  }

  close() {
    this.currentDialogRef.close();
  }

  getDeclineContractorVariants () {
    this.projectRequestService
      .getDeclineContractorVariants(this.projectRequest.id)
      .subscribe(
        variants => {
          this.declineContractorVariants = variants;
        },
        err => {
          console.log(err);
        }
      );
  }

  onSubmit(form) {
    let declineContractorRequest = {
      comment: this.comment,
      reason: this.reason
    };
    this.onConfirm.emit(declineContractorRequest)
  }

}
