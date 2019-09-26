import { Component, OnDestroy } from '@angular/core';
import { ContractorProjectShort, Pagination } from '../../../../model/data-model';
import { ProjectService } from '../../../../api/services/project.service';
import { ProjectActionService } from '../../../../util/project-action.service';
import { RestPage } from '../../../../api/models/RestPage';
import { reCalculatePageable } from '../../../../util/functions';
import { Subscription } from 'rxjs';

interface Tab {
  label: string;
  active: boolean;
  latest: boolean;
  pagination: Pagination;
  pageable: RestPage<ContractorProjectShort>;
  projects: Array<ContractorProjectShort>;
}

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnDestroy {
  maxItemPerPage: number = 10;
  search: string = '';
  fetching = true;
  showMoreFetching = false;
  filterTimeout;
  tabs: Array<Tab> = [];
  private onProjectsUpdate$: Subscription;

  constructor(private projectService: ProjectService,
              public projectActionService: ProjectActionService) {
    this.tabs = [
      {
        label: 'In Progress',
        latest: true,
        active: true,
        pagination: new Pagination(0, this.maxItemPerPage),
        pageable: new RestPage<ContractorProjectShort>(),
        projects: []
      },
      {
        label: 'Previous',
        latest: false,
        active: false,
        pagination: new Pagination(0, this.maxItemPerPage),
        pageable: new RestPage<ContractorProjectShort>(),
        projects: []
      }
    ];
    this.onProjectsUpdate$ = this.projectActionService.onProjectsUpdate.subscribe(() => {
      this.updateTab();
    });
    this.getProjects(this.tabs[0]);
  }

  getProjects(tab: Tab, forUpdate: Pagination = undefined): void {
    this.tabs.map(item => item.active = false);
    tab.active = true;
    this.fetching = true;
    if (!tab.pageable.first) {
      forUpdate = new Pagination(0, tab.projects.length);
    }
    const pagination = forUpdate ? forUpdate : tab.pagination;
    this.projectService.getAllForContractor(tab.latest, this.search.toLowerCase(), pagination).subscribe(
      (pageable: RestPage<ContractorProjectShort>) => {
        this.fetching = false;
        this.showMoreFetching = false;
        tab.pageable = forUpdate ? reCalculatePageable<ContractorProjectShort>(tab.pageable, pageable, this.maxItemPerPage) : pageable;
        tab.projects = pageable.content;
      },
      err => {
        this.fetching = false;
        this.showMoreFetching = false;
        console.log(err);
      }
    );
  }

  showMoreProjects(tab: Tab): void {
    this.showMoreFetching = true;
    this.projectService.getAllForContractor(tab.latest, this.search.toLowerCase(), tab.pagination.nextPage())
      .subscribe(
        (pageable: RestPage<ContractorProjectShort>) => {
          this.fetching = false;
          this.showMoreFetching = false;
          tab.pageable = pageable;
          tab.projects = [...tab.projects, ...pageable.content];
        },
        err => {
          this.fetching = false;
          this.showMoreFetching = false;
          console.log(err);
        }
      );
  }

  filter(): void {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(this.updateTab, 300);
  }

  updateTab = () => {
    const tab: Tab = this.tabs.find(item => item.active);
    if (!tab.pageable.first) {
      this.getProjects(tab, new Pagination(0, tab.projects.length));
    } else {
      this.getProjects(tab, new Pagination(0, this.maxItemPerPage));
    }
  }

  ngOnDestroy() {
    if(this.onProjectsUpdate$) {
      this.onProjectsUpdate$.unsubscribe();
    }
  }
}
