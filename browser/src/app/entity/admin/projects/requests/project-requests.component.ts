import { Component, ElementRef, ViewChild } from '@angular/core';
import { RestPage } from '../../../../api/models/RestPage';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { ProjectRequestService } from '../../../../api/services/project-request.service';
import { Pagination } from '../../../../model/data-model';
import { AdminProjectRequest } from '../../../../api/models/AdminProjectRequest';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { filtersToParams, TricksService } from '../../../../util/tricks.service';
import { Project } from '../../../../api/models/Project';
import { ActivatedRoute, Router } from '@angular/router';
import { dataTableFilter } from '../../util';
import { ProjectRequest } from '../../../../api/models/ProjectRequest';
import { ProjectMessage } from '../../../../api/models/ProjectMessage';
import { getErrorMessage } from '../../../../util/functions';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { ProjectService } from '../../../../api/services/project.service';

@Component({
  selector: 'projectRequests',
  templateUrl: './project-requests.component.html',
  styleUrls: ['./project-requests.component.scss']
})
export class ProjectRequestsComponent {
  @ViewChild('dt') dataTable: any;
  @ViewChild('messenger') messengerWrapper: ElementRef;
  rowsPerPage: Array<number> = [10, 50, 100];
  projectRequests: RestPage<AdminProjectRequest> = new RestPage<AdminProjectRequest>();
  messages: Array<ProjectMessage>;
  processing = true;
  fetchingMessages: boolean = false;
  displayMessenger: boolean = false;
  ProjectRequest = ProjectRequest;
  projectRequestReasons: Array<SelectItem> = [];
  projectRequestStatuses: Array<SelectItem> = [];
  projectStatuses: Array<SelectItem> = [];
  tableColumns: Array<SelectItem> = [];
  selected: AdminProjectRequest;
  selectedTableCols: Array<string> = [
    'id',
    'contractor',
    'customer',
    'status',
    'serviceType',
    'projectStatus',
    'created',
    'refund'
  ];
  contextMenuItems: Array<MenuItem> = [
    {
      label: 'View Project',
      icon: 'fa fa-list-ul',
      command: () => this.moveToProject(this.selected)
    },
    {
      label: 'View Messenger',
      icon: 'fa fa-comments',
      command: () => this.viewMessages(this.selected)
    }
  ];

  filters: any;

  constructor(private projectRequestService: ProjectRequestService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private trickService: TricksService,
              private route: ActivatedRoute,
              private router: Router,
              public popUpMessageService: PopUpMessageService,
              public projectService: ProjectService,) {
    this.route.queryParams.subscribe(params => {
      this.filters = {
        ...dataTableFilter('contractorEmail', params['pro']),
        ...dataTableFilter('id', params['id'])
      };
    });
    this.projectRequestStatuses = this.trickService.enumToJson(ProjectRequest.Status).map(item => {
      return {label: item.label, value: item.value};
    });
    this.projectRequestStatuses.unshift({label: 'All', value: ''});
    this.projectRequestReasons = this.trickService.enumToJson(ProjectRequest.Reason).map(item => {
      return {label: item.label, value: item.value};
    });
    this.projectRequestReasons.unshift({label: 'All', value: ''});
    this.projectStatuses = this.trickService.enumToJson(Project.Status).map(item => {
      return {label: item.label, value: item.value};
    });
    this.projectStatuses.unshift({label: 'All', value: ''});
  }

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  loadLazy(event): void {
    this.getProjectRequests(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  getProjectRequests(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.projectRequestService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<AdminProjectRequest>) => {
        this.processing = false;
        this.projectRequests = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(item => !(item == 'projectId'))
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
      });
  }

  selectItem(selection: { originalEvent: MouseEvent, data: AdminProjectRequest }): void {
    this.selected = selection.data;
  }

  moveToProject(projectRequest: AdminProjectRequest): void {
    this.router.navigate(['admin', 'projects'], {queryParams: {id: projectRequest.projectId}});
  }

  viewMessages(projectRequest: AdminProjectRequest): void {
    this.displayMessenger = true;
    this.fetchingMessages = true;
    this.projectRequestService.getMessages(projectRequest.id).subscribe((messages: Array<ProjectMessage>) => {
      this.fetchingMessages = false;
      this.messages = messages;
      setTimeout(() => {
        this.messengerWrapper.nativeElement.scrollTop = this.messengerWrapper.nativeElement.scrollHeight;
      }, 10);
    }, err => {
      this.fetchingMessages = false;
    });
  }

  messageAuthor(sender: string | 'system'): string {
    if (sender == 'system') {
      return 'System';
    } else {
      if (this.selected.contractor.id == sender) {
        return this.selected.contractor.name;
      } else {
        return this.selected.customer.name;
      }
    }
  }

  onModalClose(event): void {
    this.messages = [];
  }

  expandRow(selection: { originalEvent: MouseEvent, data }): void {
    if (!this.dataTable.expandedRows) {
      this.dataTable.expandedRows = [];
    }
    if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
      this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.dataTable.expandedRows = [];
      this.projectService.getProject(selection.data.projectId).subscribe(
        (customerProject: Project) => {
          selection.data.project = customerProject;
          this.dataTable.expandedRows.push(selection.data);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }
}
