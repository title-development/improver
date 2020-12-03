import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';
import { Subject } from 'rxjs';
import { finalize, first } from "rxjs/operators";
import { CustomerProject } from "../../../model/data-model";
import { PopUpMessageService } from "../../../api/services/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";

@Component({
  selector: 'submit-project-dialog',
  templateUrl: './submit-project-dialog.component.html',
  styleUrls: ['./submit-project-dialog.component.scss']
})

export class SubmitProjectDialogComponent implements OnInit, OnDestroy {

  project: CustomerProject;
  reloadProject = false;
  loading = true
  submitting = false
  onConfirm :EventEmitter<any> = new EventEmitter<any>();
  private readonly destroyed$ = new Subject<void>();

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public projectService: ProjectService,
              public popUpMessageService: PopUpMessageService) {
  }

  ngOnInit() {
    if (this.reloadProject) {
      this.getProject();
    } else {
      this.loading = false
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  close() {
    this.currentDialogRef.close();
  }

  onSubmit(form) {
    this.submitting = true;
    this.onConfirm.emit()
  }

  getProject() {
    this.projectService.getForCustomer(this.project.id)
      .pipe(first(), finalize(() => this.loading = false))
      .subscribe(
        project => this.project = project,
        error => this.popUpMessageService.showError(getErrorMessage(error))
        )
  }

}

