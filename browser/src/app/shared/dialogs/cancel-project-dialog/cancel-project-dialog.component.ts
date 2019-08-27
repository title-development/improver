import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CloseProjectRequest, CloseProjectVariant, CustomerProjectShort } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil, publishReplay, refCount } from 'rxjs/operators';

@Component({
  selector: 'cancel-project-dialog',
  templateUrl: './cancel-project-dialog.component.html',
  styleUrls: ['./cancel-project-dialog.component.scss']
})

export class CancelProjectDialogComponent implements OnInit, OnDestroy {

  project: CustomerProjectShort;
  closeProjectVariants$: Observable<CloseProjectVariant>;
  reason: string;
  comment: string;
  onConfirm: EventEmitter<any> = new EventEmitter<any>();
  private readonly destroyed$ = new Subject<void>();

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
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  close() {
    this.currentDialogRef.close();
  }

  getCloseProjectVariants() {
    this.closeProjectVariants$ = this.projectService.getCloseProjectVariants(this.project.id)
      .pipe(
        takeUntil(this.destroyed$),
        publishReplay(1),
        refCount()
      );
  }

  onSubmit(form) {
    let closeProjectRequest: CloseProjectRequest = {
      action: 'CANCEL',
      comment: this.comment,
      reason: this.reason
    };
    this.onConfirm.emit(closeProjectRequest);
  }

}
