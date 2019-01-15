import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material";
import { CloseProjectRequest, CloseProjectVariant, CompanyProfile, ContractorProjectShort, CustomerProjectShort } from "../../../model/data-model";
import { SecurityService } from "../../../auth/security.service";
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';

@Component({
  selector: 'cancel-project-dialog',
  templateUrl: './cancel-project-dialog.component.html',
  styleUrls: ['./cancel-project-dialog.component.scss']
})

export class CancelProjectDialogComponent implements OnInit, OnDestroy {

  project: CustomerProjectShort;
  closeProjectVariants: CloseProjectVariant;
  reason: string;
  comment: string;
  onConfirm :EventEmitter<any> = new EventEmitter<any>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public projectService: ProjectService) {
  }

  ngOnInit() {
    this.getCloseProjectVariants();
  }

  ngOnDestroy(): void {
  }

  close() {
    this.currentDialogRef.close();
  }

  getCloseProjectVariants () {
    this.projectService
      .getCloseProjectVariants(this.project.id)
      .subscribe(
        response => {
          this.closeProjectVariants = response as CloseProjectVariant;
          console.log(this.closeProjectVariants);
        },
        err => {
          console.log(err);
        }
      );
  }

  onSubmit(form) {
    let closeProjectRequest: CloseProjectRequest = {
      action: "CANCEL",
      comment: this.comment,
      reason: this.reason
    };
    this.onConfirm.emit(closeProjectRequest)
  }

}
