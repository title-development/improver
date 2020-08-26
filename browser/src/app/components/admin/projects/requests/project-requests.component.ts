import { Component, ElementRef, ViewChild } from '@angular/core';
import { RestPage } from '../../../../api/models/RestPage';
import { MenuItem, SelectItem } from 'primeng';
import { ProjectRequestService } from '../../../../api/services/project-request.service';
import { Pagination } from '../../../../model/data-model';
import { AdminProjectRequest } from '../../../../api/models/AdminProjectRequest';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { filtersToParams, TricksService } from '../../../../api/services/tricks.service';
import { Project } from '../../../../api/models/Project';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectRequest } from '../../../../api/models/ProjectRequest';
import { ProjectMessage } from '../../../../api/models/ProjectMessage';
import { getErrorMessage } from '../../../../util/functions';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { ProjectService } from '../../../../api/services/project.service';

@Component({
  selector: 'projectRequests',
  templateUrl: './project-requests.component.html',
  styleUrls: ['./project-requests.component.scss']
})
export class ProjectRequestsComponent {
  @ViewChild('dt') table: any;
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
  selected: AdminProjectRequest;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'contractor', header: 'Contractor', active: true},
    {field: 'customer', header: 'Customer', active: true},
    {field: 'serviceType', header: 'Service Type', active: true},
    {field: 'status', header: 'Status', active: true},
    {field: 'reason', header: 'Reason', active: false},
    {field: 'reasonComment', header: 'Reason Comment', active: false},
    {field: 'projectStatus', header: 'Project Status', active: true},
    {field: 'refundRequest', header: 'Refund Request', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'updated', header: 'Created', active: false},
    {field: 'manual', header: 'Is Manual', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

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

  constructor(private projectRequestService: ProjectRequestService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private trickService: TricksService,
              private route: ActivatedRoute,
              private router: Router,
              public popUpMessageService: PopUpMessageService,
              public projectService: ProjectService,) {
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

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getProjectRequests(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getProjectRequests(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.projectRequestService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<AdminProjectRequest>) => {
        this.processing = false;
        this.projectRequests = restPage;
      }, err => {
        this.processing = false;
      });
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
    if (!this.table.expandedRows) {
      this.table.expandedRows = [];
    }
    if (this.table.expandedRows.some(item => item.id == selection.data.id)) {
      this.table.expandedRows = this.table.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.table.expandedRows = [];
      this.projectService.getProject(selection.data.projectId).subscribe(
        (customerProject: Project) => {
          selection.data.project = customerProject;
          this.table.expandedRows.push(selection.data);
        },
        err => {
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }
}
