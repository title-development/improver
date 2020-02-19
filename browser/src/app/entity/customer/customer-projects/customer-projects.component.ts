import { Component, OnDestroy } from '@angular/core';
import { CustomerProjectShort, Pagination, ServiceType } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { MatDialog } from '@angular/material/dialog';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectService } from '../../../api/services/project.service';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { ProjectActionService } from '../../../util/project-action.service';
import { FindProfessionalService } from '../../../util/find-professional.service';
import { Project } from '../../../api/models/Project';
import { RestPage } from '../../../api/models/RestPage';
import { getErrorMessage, reCalculatePageable } from '../../../util/functions';
import { ProjectRequest } from '../../../api/models/ProjectRequest';
import { finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

interface Tab {
  label: string;
  active: boolean;
  latest: boolean;
  pagination: Pagination;
  pageable: RestPage<CustomerProjectShort>;
  projects: Array<CustomerProjectShort>;
}

@Component({
  selector: 'customer-dashboard-page',
  templateUrl: './customer-projects.component.html',
  styleUrls: ['./customer-projects.component.scss']
})

export class CustomerDashboardComponent implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  Project = Project;
  ProjectStatus = Project.Status;
  ProjectRequest = ProjectRequest;
  projectsProcessing = true;
  recommendedServiceTypes: ServiceType[];
  onProjectsUpdate$;
  maxItemPerPage: number = 6;
  tabs: Array<Tab> = [
    {
      label: 'Current',
      latest: true,
      active: true,
      pagination: new Pagination(0, this.maxItemPerPage),
      pageable: new RestPage<CustomerProjectShort>(),
      projects: []
    },
    {
      label: 'Previous',
      latest: false,
      active: false,
      pagination: new Pagination(0, this.maxItemPerPage),
      pageable: new RestPage<CustomerProjectShort>(),
      projects: []
    }
  ];

  constructor(public dialog: MatDialog,
              public popUpMessageService: PopUpMessageService,
              public projectActionService: ProjectActionService,
              public findProfessionalService: FindProfessionalService,
              private securityService: SecurityService,
              private projectRequestService: ProjectRequestService,
              private projectService: ProjectService,
              private serviceTypeService: ServiceTypeService) {
    this.getProjects(this.tabs[0]);
    this.getRecommendedServiceTypes();
    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.updateTab());
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

    openProjectRequest(project: CustomerProjectShort) {
    this.projectRequestService.getProjectRequest(project.id).subscribe(
      projectRequest => {
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => this.popUpMessageService.showError(getErrorMessage(err))
    );
  }

  getProjects(tab: Tab, forUpdate: Pagination = undefined) {
    this.tabs.map(item => item.active = false);
    tab.active = true;
    this.projectsProcessing = true;
    if (!tab.pageable.first) {
      forUpdate = new Pagination(0, tab.projects.length);
    }
    const pagination = forUpdate ? forUpdate : tab.pagination;
    this.projectService.getAllForCustomer(tab.latest, pagination)
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.projectsProcessing = false)
      )
      .subscribe(
      (pageable: RestPage<CustomerProjectShort>) => {
        tab.pageable = forUpdate ? reCalculatePageable(tab.pageable, pageable, this.maxItemPerPage) : pageable;
        this.moveHiredContractorsToFirstPosition(pageable.content);
        tab.projects = pageable.content;
      },
        err => this.popUpMessageService.showError(getErrorMessage(err))
    );
  }

  showMoreProjects(tab: Tab) {
    this.projectService.getAllForCustomer(tab.latest, tab.pagination.nextPage())
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => this.projectsProcessing = false)
      )
      .subscribe((pageable: RestPage<CustomerProjectShort>) => {
          tab.pageable = pageable;
          // this.moveHiredContractorsToFirstPosition(pageable.content);
          tab.projects = [...tab.projects, ...pageable.content];
        },
        err => this.popUpMessageService.showError(getErrorMessage(err))
      );
  }


  getRecommendedServiceTypes() {
    this.serviceTypeService
      .getRecommended(this.securityService.getLoginModel().id, 6)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        recommendedServiceTypes => {
          this.recommendedServiceTypes = recommendedServiceTypes;
        },
        err => this.popUpMessageService.showError(getErrorMessage(err))
      )
  }

  restoreProject() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  openQuestionary() {
    this.popUpMessageService.showMessage(this.popUpMessageService.METHOD_NOT_IMPLEMENTED);
    throw new Error('Method not implemented.');
  }

  private updateTab(): void {
    const tab: Tab = this.tabs.find(item => item.active);
    if (!tab.pageable.first) {
      this.getProjects(tab, new Pagination(0, tab.projects.length));
    } else {
      this.getProjects(tab, new Pagination(0, this.maxItemPerPage));
    }
  }

  moveHiredContractorsToFirstPosition(projects: CustomerProjectShort[]) {
    for (let project of projects) {
      if (project.projectRequests.length === 0) continue;
      let index = project.projectRequests.findIndex(projectRequest =>
        ProjectRequest.isHiredOrCompleted(projectRequest.status));
      if (index < 0) continue;
      let hired = project.projectRequests[index];
      project.projectRequests.splice(index,1);
      project.projectRequests.unshift(hired);
    }
  }

}
