import { Component, ElementRef, EventEmitter, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { take, takeUntil } from "rxjs/internal/operators";
import { Subject, Subscription } from 'rxjs';
import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";
import { NavigationHelper } from "../../../util/navigation-helper";

@Component({
  selector: 'customer-project-request-dialog',
  templateUrl: './customer-project-request-dialog.component.html',
  styleUrls: ['./customer-project-request-dialog.component.scss']
})

export class CustomerProjectRequestDialogComponent implements OnInit, OnDestroy {
  private readonly COMPANY_NAME_TRUNCATE_DEFAULT = 50;
  private readonly COMPANY_NAME_TRUNCATE_XS = 30;
  private readonly destroyed$: Subject<void> = new Subject();
  activeTab = 'MESSAGES';
  @ViewChild('reviewsScrollBar') reviewsScrollBar: PerfectScrollbarComponent;
  ProjectRequest = ProjectRequest;
  Project = Project;
  companyProfile: CompanyProfile;
  showAddReviewForm: boolean = false;
  isLeaveReviewButtonDisabled: boolean = false;
  openMessage: boolean = false;
  isReviewSend = false;
  projectRequest: ProjectRequest;
  onCompanyHire: EventEmitter<any>;
  onCompanyDecline: EventEmitter<any>;
  private onProjectsUpdate$: Subscription;
  mediaQuery: MediaQuery;
  companyNameTruncate: number = this.COMPANY_NAME_TRUNCATE_DEFAULT;

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
              private mediaQueryService: MediaQueryService,
              private navigationHelper: NavigationHelper,
              @Inject('Window') private window: Window) {

    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe(mediaQuery => {
        this.mediaQuery = mediaQuery;
        this.companyNameTruncate = mediaQuery.xs ? this.COMPANY_NAME_TRUNCATE_XS : this.COMPANY_NAME_TRUNCATE_DEFAULT
      });

    this.router.events.pipe(
      take(1)
    ).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.dialog.closeAll();
      }
    });

    this.projectActionService.onProjectsUpdate
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.getProjectRequest(this.projectRequest.id));
  }

  ngOnInit(): void {
    this.loadOverview();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  reviewSend(event): void {
    this.showAddReviewForm = false;
    if (event){
      this.isReviewSend = event;
      this.isLeaveReviewButtonDisabled = true
    } else {
      this.isLeaveReviewButtonDisabled = false;
    }
    this.activeTab = 'REVIEWS';
    this.getProjectRequest(this.projectRequest.id);
  }

  openAddReviewForm() {
    this.showAddReviewForm = true;
    this.isLeaveReviewButtonDisabled = true;
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
      err => {
        console.error(err);
      }
    );
  }

  updateProjectRequestStatus(status: ProjectRequest.Status) {
    this.projectRequest.status = status;
  }


  loadOverview(): void {
    this.companyService.getProfile(this.projectRequest.company.id).subscribe(
      companyProfile => {
        this.companyProfile = companyProfile;
      },
      err => {
        console.error(err);
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
