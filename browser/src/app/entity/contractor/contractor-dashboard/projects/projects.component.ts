import { Component, OnDestroy } from '@angular/core';
import { ContractorProjectShort, Lead, Pagination } from '../../../../model/data-model';
import { ProjectService } from '../../../../api/services/project.service';
import { ProjectActionService } from '../../../../util/project-action.service';
import { RestPage } from '../../../../api/models/RestPage';
import { getErrorMessage } from '../../../../util/functions';
import { Subject, Subscription } from 'rxjs';
import { LeadService } from "../../../../api/services/lead.service";
import { finalize, takeUntil } from "rxjs/operators";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { MediaQuery, MediaQueryService } from "../../../../util/media-query.service";
import { ActivatedRoute, Router } from "@angular/router";

interface Tab {
  label?: string;
  active?: boolean;
  type?: TabType;
  pagination?: Pagination;
  pageable?: RestPage<ContractorProjectShort | Lead>;
  projects?: Array<ContractorProjectShort | Lead>;
}

enum TabType {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  PREVIOUS = 'PREVIOUS'
}

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnDestroy {
  private readonly destroyed$ = new Subject<void>();
  TabType = TabType;
  maxItemPerPage: number = 10;
  searchTerm: string = '';
  fetching = true;
  showMoreFetching = false;
  filterTimeout;
  tabs: Array<Tab> = [];
  private onProjectsUpdate$: Subscription;
  mediaQuery: MediaQuery;

  constructor(private projectService: ProjectService,
              private leadService: LeadService,
              private popUpService: PopUpMessageService,
              private mediaQueryService: MediaQueryService,
              private route: ActivatedRoute,
              private router: Router,
              public projectActionService: ProjectActionService) {

    this.tabs = [
      {
        label: 'New',
        type: TabType.NEW,
        active: false,
        pagination: new Pagination(0, this.maxItemPerPage),
        pageable: new RestPage<Lead>(),
        projects: []
      },
      {
        label: 'In Progress',
        type: TabType.IN_PROGRESS,
        active: false,
        pagination: new Pagination(0, this.maxItemPerPage),
        pageable: new RestPage<ContractorProjectShort>(),
        projects: []
      },
      {
        label: 'Previous',
        type: TabType.PREVIOUS,
        active: false,
        pagination: new Pagination(0, this.maxItemPerPage),
        pageable: new RestPage<ContractorProjectShort>(),
        projects: []
      }
    ];

    this.mediaQueryService.screen
      .pipe(takeUntil(this.destroyed$))
      .subscribe((mediaQuery: MediaQuery) => {
        this.mediaQuery = mediaQuery;
        let activeTab = this.tabs.find(tab => tab.active);
        if ((this.mediaQuery.lg || this.mediaQuery.xlg)) {
          if (activeTab && activeTab.type == TabType.NEW) {
            this.router.navigate([], {fragment: "in-progress"})
          }
        }
      });

    this.route.fragment.subscribe ( fragment => {
      this.searchTerm = '';
      switch (fragment) {
        case 'new':
          if ((this.mediaQuery.lg || this.mediaQuery.xlg)) {
            this.router.navigate([], {fragment: "in-progress"})
          } else {
            this.getProjects(this.tabs[0]);
          }
          break;
        case 'in-progress':
          this.getProjects(this.tabs[1]);
          break;
        case 'previous':
          this.getProjects(this.tabs[2]);
          break;
        default:
          if ((this.mediaQuery.lg || this.mediaQuery.xlg)) {
            this.router.navigate([], {fragment: "in-progress"})
          } else {
            this.router.navigate([], {fragment: "new"})
          }
      }
    });

    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => this.updateTab());

  }

  getProjects(tab: Tab, update?: boolean): void {
    this.tabs.forEach(item => item.active = false);
    tab.active = true;
    this.fetching = true;

    let itemsCount = update ? tab.projects.length : this.maxItemPerPage;
    let pagination = new Pagination(0, itemsCount);

    let request;

    if (tab.type == TabType.NEW) {
      request = this.leadService.getAllInCoverage(this.searchTerm.toLowerCase(), pagination);
    } else {
      request = this.projectService.getAllForContractor(tab.type == TabType.IN_PROGRESS, this.searchTerm.toLowerCase(), pagination)
    }

    request
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => {
          this.fetching = false;
          this.showMoreFetching = false;
        })
      )
      .subscribe(
      (pageable: RestPage<any>) => {
        if(!update) {
          tab.pageable = pageable
          tab.pagination = pagination;
        }
        tab.projects = pageable.content;
      },
      err => this.popUpService.showError(getErrorMessage(err))
    );
  }

  showMoreProjects(tab: Tab): void {
    this.showMoreFetching = true;
    let request;
    if (tab.type == TabType.NEW) {
      request = this.leadService.getAllInCoverage(this.searchTerm.toLowerCase(), tab.pagination.nextPage());
    } else {
      request = this.projectService.getAllForContractor(tab.type == TabType.IN_PROGRESS, this.searchTerm.toLowerCase(), tab.pagination.nextPage())
    }

    request
      .pipe(
        takeUntil(this.destroyed$),
        finalize(() => {
          this.fetching = false;
          this.showMoreFetching = false;
        })
      )
      .subscribe(
        (pageable: RestPage<any>) => {
          tab.pageable = pageable;
          tab.projects = [...tab.projects, ...pageable.content];
        },
        err => this.popUpService.showError(getErrorMessage(err))
      );

  }

  filter() {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.getProjects(this.tabs.find(item => item.active))
    }, 300);
  }

  updateTab() {
    this.getProjects(this.tabs.find(item => item.active), true);
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
