import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerProject } from '../../../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PopUpMessageService } from '../../../api/services/pop-up-message.service';
import { ProjectService } from '../../../api/services/project.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectActionService } from '../../../api/services/project-action.service';
import { Project } from '../../../api/models/Project';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { SomePipe } from 'angular-pipes';
import { Observable, Subject, Subscription } from 'rxjs';
import { ComponentCanDeactivate } from '../../../auth/router-guards/component-can-deactivate.guard';
import { ImagesUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';
import { NavigationHelper } from "../../../util/helpers/navigation-helper";
import { NotificationResource } from "../../../util/notification.resource";
import { filter, takeUntil } from "rxjs/operators";
import { MediaQuery, MediaQueryService } from "../../../api/services/media-query.service";
import { dialogsMap } from "../../../shared/dialogs/dialogs.state";
import { confirmDialogConfig, projectRequestReviewDialogConfig } from "../../../shared/dialogs/dialogs.configs";
import { map } from "rxjs/internal/operators";
import moveHiredContractorsToFirstPosition = Project.moveHiredContractorsToFirstPosition;

@Component({
  selector: 'customer-project-view',
  templateUrl: './customer-project-view.component.html',
  styleUrls: ['./customer-project-view.component.scss']
})

export class CustomerProjectViewComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  private readonly destroyed$ = new Subject<void>();

  projectId: number;
  project: CustomerProject;
  ProjectRequest = ProjectRequest;
  Project = Project;
  mediaQuery: MediaQuery;
  reviewDialogRef: MatDialogRef<any>;
  private hashFragment: string;
  private projectRequestRouterParams$: Subscription;
  private projectDialogOpened: boolean = false;
  @ViewChild(ImagesUploaderComponent) imageUploader;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public projectActionService: ProjectActionService,
              public projectRequestService: ProjectRequestService,
              public router: Router,
              public somePipe: SomePipe,
              public navigationHelper: NavigationHelper,
              private mediaQueryService: MediaQueryService,
              private notificationResource: NotificationResource,
              private changeDetectorRef: ChangeDetectorRef) {

    this.route.params.subscribe(params => {
      let projectIdParam = parseInt(params['id']);
        if (!this.project && projectIdParam || this.project && this.project.id != projectIdParam) {
          this.projectId = projectIdParam;
          this.getProject();
        }
      }

    );

    this.projectActionService.onProjectsUpdate
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
      if (!this.projectDialogOpened) {
        this.getProject();
      }
    });

    this.projectActionService.onCloseProjectRequestDialog
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.projectDialogOpened = false;
        this.getProject();
      });

    this.notificationResource.notifiedProjectId$
      .pipe(takeUntil(this.destroyed$), filter(projectId => projectId && this.projectId == projectId))
      .subscribe(projectId => {
      if (!this.projectDialogOpened) {
        this.getProject();
      }
    });

    this.subscribeForMediaQuery();

  }

  ngOnInit() {
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (!(this.imageUploader && this.imageUploader.hasUnsavedImages())) {
      return true
    } else {
      let properties = {
        title: 'Unsaved changes',
        message: `You have unsaved changes in your project. Are you sure you want to leave now?`,
        OK: 'Stay',
        CANCEL: 'Leave'
      };
      let confirmDialogRef = this.dialog.open(dialogsMap['confirm-dialog'], confirmDialogConfig);
      confirmDialogRef
        .afterClosed()
        .subscribe(result => {
          confirmDialogRef = null;
        });
      confirmDialogRef.componentInstance.properties = properties as any;
      return confirmDialogRef.componentInstance.onAction.pipe(map(value => !value))
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload(event): any {
    if ((this.imageUploader && this.imageUploader.hasUnsavedImages())) {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  subscribeForMediaQuery(){
    this.mediaQueryService.screen
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });
  }

  openAddReviewForm(projectRequest: ProjectRequest) {
    this.dialog.closeAll();
    this.reviewDialogRef = this.dialog.open(dialogsMap['customer-add-review-dialog'], projectRequestReviewDialogConfig);
    this.reviewDialogRef.componentInstance.projectRequest = projectRequest;
    this.reviewDialogRef.componentInstance.isMatDialogWindow = true;
    this.reviewDialogRef.afterClosed().subscribe(result => {
          this.reviewDialogRef = null;
    });
    this.reviewDialogRef.componentInstance.onLoadReviews.subscribe( leaveReview => {
      if (leaveReview) {
        this.getProject();
      }
      this.dialog.closeAll();
    });
  }

  openProjectRequest(projectRequest: ProjectRequest) {
    this.router.navigate([], {fragment: projectRequest.id.toString()})
  }

  getProject() {
    this.projectService
      .getForCustomer(this.projectId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        (project: CustomerProject) => {
          this.projectActionService.project = this.project = project;
          this.getProjectRequest();
          if (this.projectActionService.projectRequestDialogRef) {
            this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest =
              project.projectRequests.find((item) =>
                item.id == this.projectActionService.projectRequestDialogRef.componentInstance.projectRequestId);
          }
          if (!this.changeDetectorRef['destroyed']) {
            this.changeDetectorRef.detectChanges();
          }
          moveHiredContractorsToFirstPosition([project]);
        },
        err => {
          console.error(err);
          if (err.status == 404) {
            this.router.navigate(['404']);
          }
        }
      );
  }

  getProjectRequest() {
    if (!this.projectRequestRouterParams$) {
      this.projectRequestRouterParams$ = this.route.fragment.subscribe((fragment: string) => {
        this.hashFragment = fragment;
        if (fragment) {
          let projectRequestIndex = this.project.projectRequests.findIndex(pr => pr.id == fragment);
          if (projectRequestIndex >= 0) {
            this.project.projectRequests[projectRequestIndex].unreadMessages = 0;
          }
          this.projectActionService.openProjectRequest(fragment);
        }
      });
    }
  }

  isInactiveProsExist() {
    return this.somePipe.transform(this.project.projectRequests.map(p => p.status), ProjectRequest.isInactive);
  }

  isActiveProsExist() {
    return this.somePipe.transform(this.project.projectRequests.map(p => p.status), ProjectRequest.isActive);
  }

  unreadMessagesTittle(count: number): string {
    if (count > 1) {
      return `You have ${count} new messages`;
    } else {
      return `You have ${count} new message`;
    }
  }
}

