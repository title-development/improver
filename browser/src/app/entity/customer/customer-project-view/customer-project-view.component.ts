import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  CloseProjectRequest, CustomerProject, Review
} from '../../../model/data-model';
import { MatDialog, MatDialogRef } from '@angular/material';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { ProjectService } from '../../../api/services/project.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectActionService } from '../../../util/project-action.service';
import { Project } from '../../../api/models/Project';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { getErrorMessage } from '../../../util/functions';
import { SomePipe } from 'angular-pipes';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'customer-project-view',
  templateUrl: './customer-project-view.component.html',
  styleUrls: ['./customer-project-view.component.scss']
})

export class CustomerProjectViewComponent implements OnInit, OnDestroy {

  projectId: number;
  project: CustomerProject;
  ProjectRequest = ProjectRequest;
  Project = Project;
  private onProjectsUpdate$: Subscription;
  private onProjectDialogClose$: Subscription;

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
      this.getProject();
    });
    this.onProjectDialogClose$ = this.projectActionService.onCloseProjectRequestDialog.subscribe(() => {
      this.projectId = null;
      this.router.navigate([]); //clear hash fragment from url (projects/22#21 => projects/22)
      this.getProject();
    })
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
    if(this.onProjectDialogClose$) {
      this.onProjectDialogClose$.unsubscribe();
    }
  }

  openProjectRequest(projectRequest: ProjectRequest) {
    projectRequest.unreadMessages = 0; // Mutation for optimistic UI
    this.projectRequestService.getProjectRequest(projectRequest.id).subscribe(
      projectRequest => {
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
        this.popUpMessageService.showError(getErrorMessage(err));
      }
    );
  }

  openProjectRequestByUrlFragment(projectRequestId: string) {
    this.projectRequestService.getProjectRequest(projectRequestId).subscribe(
      projectRequest => {
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
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
            this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest = project.projectRequests.find((item) => item.id == this.projectActionService.projectRequestDialogRef.componentInstance.projectRequest.id);
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
      if (fragment) {
        this.openProjectRequestByUrlFragment(fragment);
      }
    });
  }

  isProjectRequestInactive = (item) => {
    return !this.isProjectRequestActive(item);
  };

  isProjectRequestActive(item) {
    return item.status == ProjectRequest.Status.HIRED || item.status == ProjectRequest.Status.COMPLETED || item.status == ProjectRequest.Status.ACTIVE;
  }


  isInactiveProsExist() {
    return this.somePipe.transform(this.project.projectRequests, this.isProjectRequestInactive);
  }

  isActiveProsExist() {
    return this.somePipe.transform(this.project.projectRequests, this.isProjectRequestActive);
  }

  unreadMessagesTittle(count: number): string {
    if (count > 1) {
      return `You have ${count} new messages`;
    } else {
      return `You have ${count} new message`;
    }
  }
}

