import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CloseProjectVariant, CustomerProjectShort } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { CompanyService } from '../../../api/services/company.service';
import { ProjectService } from '../../../api/services/project.service';
import { publishReplay, refCount, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'complete-project-dialog',
  templateUrl: './complete-project-dialog.component.html',
  styleUrls: ['./complete-project-dialog.component.scss']
})

export class CompleteProjectDialogComponent implements OnInit, OnDestroy {

  project: CustomerProjectShort;
  closeProjectVariants$: Observable<CloseProjectVariant>;
  reason: string;
  comment: string;
  onConfirm :EventEmitter<any> = new EventEmitter<any>();
  selectedVariant : any;
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

  getCloseProjectVariants () {
    this.closeProjectVariants$ = this.projectService.getCloseProjectVariants(this.project.id)
      .pipe(
        takeUntil(this.destroyed$),
        publishReplay(1),
        refCount()
      )
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

