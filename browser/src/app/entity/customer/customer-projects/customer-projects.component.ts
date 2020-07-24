import { Component, OnDestroy } from '@angular/core';
import { CustomerProjectShort, Pagination, Trade } from '../../../model/data-model';
import { SecurityService } from '../../../auth/security.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
import { filter, finalize, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { MediaQuery, MediaQueryService } from "../../../util/media-query.service";
import { dialogsMap } from "../../../shared/dialogs/dialogs.state";
import { mobileMainDialogBarConfig } from "../../../shared/dialogs/dialogs.configs";
import { TradeService } from "../../../api/services/trade.service";
import { MobileMenuService } from "../../../util/mobile-menu-service";
import { NotificationResource } from "../../../util/notification.resource";

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
  public mediaQuery: MediaQuery;
  private dialogRef: MatDialogRef<any>;
  Project = Project;
  ProjectStatus = Project.Status;
  ProjectRequest = ProjectRequest;
  projectsProcessing = true;
  recommendedTrades: Trade[];
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
              public mediaQueryService: MediaQueryService,
              public securityService: SecurityService,
              private projectRequestService: ProjectRequestService,
              private projectService: ProjectService,
              private serviceTypeService: ServiceTypeService,
              private tradeService: TradeService,
              private notificationResource: NotificationResource,
              public mobileMenuService: MobileMenuService) {
    this.getProjects(this.tabs[0]);
    this.getRecommendedTrades();
    this.subscribeForMediaScreen();
    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.updateTab());

    this.notificationResource.notifiedProjectId$
      .pipe(
        takeUntil(this.destroyed$),
        filter(projectId => {
          return this.tabs
            .find(item => item.active)
            .projects
            .map(project => project.id)
            .includes(projectId);
        })
      )
      .subscribe(projectId => {
        this.updateTab()
      });

  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  subscribeForMediaScreen(): void {
    this.mediaQueryService.screen.asObservable()
        .pipe(takeUntil(this.destroyed$))
        .subscribe((mediaQuery: MediaQuery) => {
          this.mediaQuery = mediaQuery;
        });
  }

  openMobileDialog(key): void {
    this.mobileMenuService.mobileMenuOpened = false;
    this.dialog.closeAll();
    this.mobileMenuService.findProfessionalsOpened = true;
    this.dialogRef = this.dialog.open(dialogsMap[key], mobileMainDialogBarConfig);
    this.dialogRef
        .afterClosed()
        .subscribe(result => {
          this.mobileMenuService.findProfessionalsOpened = false;
          this.dialogRef = null;
            }
        );
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
          tab.projects = [...tab.projects, ...pageable.content];
        },
        err => this.popUpMessageService.showError(getErrorMessage(err))
      );
  }


  getRecommendedTrades() {
    this.tradeService
      .getRecommended(this.securityService.getLoginModel().id, 6)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(
        recommendedTrades => {
          this.recommendedTrades = recommendedTrades;
        },
        err => this.popUpMessageService.showError(getErrorMessage(err))
      )
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
