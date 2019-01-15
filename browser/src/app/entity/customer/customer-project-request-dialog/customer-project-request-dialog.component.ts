import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { CompanyProfile } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { ReviewService } from '../../../api/services/review.service';
import { CompanyService } from '../../../api/services/company.service';
import { NavigationStart, Router } from '@angular/router';
import { PerfectScrollbarComponent } from 'ngx-perfect-scrollbar';
import { ProjectActionService } from '../../../util/project-action.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';

import { Project } from "../../../api/models/Project";
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { take } from "rxjs/internal/operators";
import { Subscription } from 'rxjs';

@Component({
  selector: 'customer-project-request-dialog',
  templateUrl: './customer-project-request-dialog.component.html',
  styleUrls: ['./customer-project-request-dialog.component.scss']
})

export class CustomerProjectRequestDialogComponent implements OnInit, OnDestroy {

  activeTab = 'MESSAGES';

  @ViewChild('reviewsScrollBar') reviewsScrollBar: PerfectScrollbarComponent;
  ProjectRequest = ProjectRequest;
  Project = Project;
  companyProfile: CompanyProfile;
  showAddReviewForm: boolean = false;
  openMessage: boolean = false;
  isReviewSend = false;
  projectRequest: ProjectRequest;
  onCompanyHire: EventEmitter<any>;
  onCompanyDecline: EventEmitter<any>;
  private onProjectsUpdate$: Subscription;

  constructor(public currentDialogRef: MatDialogRef<any>,
              public dialog: MatDialog,
              public securityService: SecurityService,
              public companyService: CompanyService,
              public reviewService: ReviewService,
              public projectActionService: ProjectActionService,
              public projectRequestService: ProjectRequestService,
              private router: Router,
              private elementRef: ElementRef,
              private renderer: Renderer2,
              @Inject('Window') private window: Window) {

    this.router.events.pipe(
      take(1)
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.dialog.closeAll();
      }
    });

    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate.subscribe(() => {
      this.getProjectRequest(this.projectRequest.id);
    });
  }

  ngOnInit(): void {
    this.loadOverview();
  }

  ngOnDestroy(): void {
    if(this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
  }

  reviewSend(event): void {
    this.showAddReviewForm = false;
    if (event) this.isReviewSend = event;
    this.activeTab = 'REVIEWS';
    this.getProjectRequest(this.projectRequest.id);
  }

  openAddReviewForm() {
    this.showAddReviewForm = true;
  }

  hireCompany(projectRequest) {
    this.onCompanyHire.emit(projectRequest);
  }

  declineCompany(projectRequest) {
    this.onCompanyDecline.emit(projectRequest);
  }

  getProjectRequest(projectRequestId) {
    this.projectRequestService.getProjectRequest(projectRequestId).subscribe(
      projectRequest => {
        this.projectRequest = projectRequest;
      },
      error => {
        console.log(error);
      }
    );
  }


  loadOverview(): void {
    console.log(this.projectRequest);
    this.companyService.getProfile(this.projectRequest.company.id).subscribe(
      companyProfile => {
        this.companyProfile = companyProfile;
      },
      err => {
        console.log(err);
      }
    );
  }

  close() {
    this.currentDialogRef.close();
  }

  trackByFn(index, item) {
    return item.id;
  }
}
