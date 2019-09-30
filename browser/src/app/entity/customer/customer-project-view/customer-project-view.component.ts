import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerProject } from '../../../model/data-model';
import { MatDialog } from '@angular/material';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { ProjectService } from '../../../api/services/project.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectActionService } from '../../../util/project-action.service';
import { Project } from '../../../api/models/Project';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { getErrorMessage } from '../../../util/functions';
import { SomePipe } from 'angular-pipes';
import { Subscription } from 'rxjs';
import { ComponentCanDeactivate } from '../../../auth/router-guards/pending-chanes.guard';
import { ImagesUploaderComponent } from '../../../shared/image-uploader/image-uploader.component';

@Component({
  selector: 'customer-project-view',
  templateUrl: './customer-project-view.component.html',
  styleUrls: ['./customer-project-view.component.scss']
})

export class CustomerProjectViewComponent implements OnInit, OnDestroy, ComponentCanDeactivate {

  projectId: number;
  project: CustomerProject;
  ProjectRequest = ProjectRequest;
  Project = Project;
  @ViewChild(ImagesUploaderComponent) imageUploader;
  private hashFragment: string;
  private onProjectsUpdate$: Subscription;
  private onProjectDialogClose$: Subscription;
  private projectDialogOpened: boolean = false;

  constructor(private route: ActivatedRoute,
              private projectService: ProjectService,
              public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public projectActionService: ProjectActionService,
              public projectRequestService: ProjectRequestService,
              public router: Router,
              public somePipe: SomePipe) {
    this.route.params.subscribe(params => {
        if (parseInt(params['id'])) {
          this.projectId = parseInt(params['id']);

          this.getProject();
        } else {
          this.router.navigate(['404']);
        }
      }
    );

    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate.subscribe(() => {
      if (!this.projectDialogOpened) {
        this.getProject();
      }
    });
    this.onProjectDialogClose$ = this.projectActionService.onCloseProjectRequestDialog.subscribe(() => {
      this.projectDialogOpened = false;
      if (this.hashFragment) {
        //navigate and refresh component
        this.router.navigate([]); //clear hash fragment from url (projects/22#21 => projects/22)
      } else {
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
    if (this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
    if (this.onProjectDialogClose$) {
      this.onProjectDialogClose$.unsubscribe();
    }
  }

  openProjectRequest(projectRequest: ProjectRequest) {
    projectRequest.unreadMessages = 0; // Mutation for optimistic UI
    this.projectRequestService.getProjectRequest(projectRequest.id).subscribe(
      projectRequest => {
        this.projectDialogOpened = true;
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
        this.projectDialogOpened = false;
        this.popUpMessageService.showError(getErrorMessage(err));
      }
    );
  }

  openProjectRequestByUrlFragment(projectRequestId: string) {
    this.projectRequestService.getProjectRequest(projectRequestId).subscribe(
      projectRequest => {
        this.projectDialogOpened = true;
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
        this.projectDialogOpened = false;
        this.router.navigate([this.router.url.split('#')[0]]);
      }
    );
  }

  getProject() {
    this.projectService
      .getForCustomer(this.projectId)
      .subscribe(
        (project: CustomerProject) => {
          this.project = project;
          this.projectActionService.project = this.project;
          this.getProjectRequest();
          if (this.projectActionService.projectRequestDialogRef) {
            this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest =
              project.projectRequests.find((item) =>
                item.id == this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest.id);
          }
        },
        err => {
          console.log(err);
          if (err.status == 404) {
            this.router.navigate(['404']);
          }
        }
      );
  }

  getProjectRequest() {
    this.route.fragment.subscribe((fragment: string) => {
      this.hashFragment = fragment;
      if (fragment) {
        this.openProjectRequestByUrlFragment(fragment);
      }
    });
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

