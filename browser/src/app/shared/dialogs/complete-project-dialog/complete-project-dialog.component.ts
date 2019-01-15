import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from "@angular/material";
import { CloseProjectVariant, CompanyProfile, ContractorProjectShort, CustomerProjectShort } from "../../../model/data-model";
import { SecurityService } from "../../../auth/security.service";
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';

@Component({
  selector: 'complete-project-dialog',
  templateUrl: './complete-project-dialog.component.html',
  styleUrls: ['./complete-project-dialog.component.scss']
})

export class CompleteProjectDialogComponent implements OnInit, OnDestroy {

  project: CustomerProjectShort;
  closeProjectVariants: CloseProjectVariant;
  reason: string;
  comment: string;
  onConfirm :EventEmitter<any> = new EventEmitter<any>();
  selectedVariant : any;

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

  selectVariant(variant, projectRequestId) {
    this.selectedVariant = {
      variant: variant,
      contractorId: projectRequestId
    }
  }

  onSubmit(form) {

    if (this.selectedVariant) {

      let body = {
        "action": "COMPLETE",
        "comment": "",
        "projectRequestId": this.selectedVariant.contractorId,
        "reason": this.selectedVariant.variant.key
      };

      this.onConfirm.emit(body)

    }

  }

}

