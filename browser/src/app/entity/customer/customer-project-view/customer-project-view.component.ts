import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerProject } from '../../../model/data-model';
import { MatDialog } from '@angular/material/dialog';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { ProjectService } from '../../../api/services/project.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectActionService } from '../../../util/project-action.service';
import { Project } from '../../../api/models/Project';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { SomePipe } from 'angular-pipes';
import { Subject, Subscription } from 'rxjs';
import { ComponentCanDeactivate } from '../../../auth/router-guards/component-can-deactivate.guard';
import { ImagesUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';
import { NavigationHelper } from "../../../util/navigation-helper";
import { NotificationResource } from "../../../util/notification.resource";
import { filter, takeUntil } from "rxjs/operators";

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
  @ViewChild(ImagesUploaderComponent) imageUploader;
  private hashFragment: string;
  private projectRequestRouterParams$: Subscription;
  private projectDialogOpened: boolean = false;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public projectActionService: ProjectActionService,
              public projectRequestService: ProjectRequestService,
              public router: Router,
              public somePipe: SomePipe,
              public navigationHelper: NavigationHelper,
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
      this.navigationHelper.removeHash();
      this.getProject();
    });

    this.notificationResource.notifiedProjectId$
      .pipe(takeUntil(this.destroyed$), filter(projectId => projectId && this.projectId == projectId))
      .subscribe(projectId => {
      if (!this.projectDialogOpened) {
        this.getProject();
      }
    });

  }

  ngOnInit() {
  }

  canDeactivate(): boolean {
    return !(this.imageUploader && this.imageUploader.hasUnsavedImages());
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event): any {
    if (!this.canDeactivate()) {
      return false;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  openProjectRequest(projectRequest: ProjectRequest) {
    this.router.navigate([], {fragment: projectRequest.id.toString()})
  }

  openProjectRequestByUrlFragment(projectRequestId: string) {
    this.projectRequestService.getProjectRequest(projectRequestId).subscribe(
      projectRequest => {
        this.projectDialogOpened = true;
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
        this.projectDialogOpened = false;
        this.navigationHelper.removeHash()
      }
    );
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
                item.id == this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest.id);
          }
          if (!this.changeDetectorRef['destroyed']) {
            this.changeDetectorRef.detectChanges();
          }
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
          this.openProjectRequestByUrlFragment(fragment);
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

