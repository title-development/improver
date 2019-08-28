import { Component, OnDestroy } from '@angular/core';
import { ServiceType, CustomerProjectShort, Pagination, ContractorProjectShort } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { MatDialog } from '@angular/material';
import { PopUpMessageService } from '../../../util/pop-up-message.service';
import { ProjectRequestService } from '../../../api/services/project-request.service';
import { ProjectService } from '../../../api/services/project.service';
import { ServiceTypeService } from '../../../api/services/service-type.service';
import { ProjectActionService } from '../../../util/project-action.service';
import { FindProfessionalService } from '../../../util/find-professional.service';
import { Project } from '../../../api/models/Project';
import { RestPage } from '../../../api/models/RestPage';
import { reCalculatePageable } from '../../../util/functions';
import { ProjectRequest } from '../../../api/models/ProjectRequest';

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
    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate.subscribe(() => {
      this.updateTab();
    });
  }

  ngOnDestroy(): void {
    if (this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
  }

    openProjectRequest(project: CustomerProjectShort) {
    this.projectRequestService.getProjectRequest(project.id).subscribe(
      projectRequest => {
        this.projectActionService.openProjectRequest(projectRequest);
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(JSON.parse(err.error).message);
      }
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
    this.projectService.getAllForCustomer(tab.latest, pagination).subscribe(
      (pageable: RestPage<CustomerProjectShort>) => {
        this.projectsProcessing = false;
        tab.pageable = forUpdate ? reCalculatePageable<CustomerProjectShort>(tab.pageable, pageable, this.maxItemPerPage) : pageable;
        this.moveHiredContractorsToFirstPosition(pageable.content);
        console.log(pageable.content);
        tab.projects = pageable.content;
      },
      err => {
        this.projectsProcessing = false;
        console.log(err);
      }
    );
  }

  showMoreProjects(tab: Tab) {
    this.projectService.getAllForCustomer(tab.latest, tab.pagination.nextPage())
      .subscribe(
        (pageable: RestPage<CustomerProjectShort>) => {
          this.projectsProcessing = false;
          tab.pageable = pageable;
          // this.moveHiredContractorsToFirstPosition(pageable.content);
          tab.projects = [...tab.projects, ...pageable.content];
        },
        err => {
          this.projectsProcessing = false;
          console.log(err);
        }
      );
  }


  getRecommendedServiceTypes() {
    this.serviceTypeService
      .getRecommended(this.securityService.getLoginModel().id, 6)
      .subscribe(
        recommendedServiceTypes => {
          this.recommendedServiceTypes = recommendedServiceTypes;
        },
        err => {
          console.log(err);
        });
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
      // projectRequest.status == ProjectRequest.Status.HIRED || projectRequest.status == ProjectRequest.Status.COMPLETED
      let index = project.projectRequests.findIndex(projectRequest =>
        projectRequest.status == ProjectRequest.Status.HIRED || projectRequest.status == ProjectRequest.Status.COMPLETED);
      if (index < 0) continue;
      let hired = project.projectRequests[index];
      console.log(index);
      console.log(hired);
      project.projectRequests.splice(index,1);
      project.projectRequests.unshift(hired);
    }
  }

}
