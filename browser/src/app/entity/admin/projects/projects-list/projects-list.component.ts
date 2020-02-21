import { Component, ElementRef, ViewChild } from '@angular/core';
import { FilterMetadata, SelectItem } from 'primeng';
import { ProjectService } from '../../../../api/services/project.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { Pagination } from '../../../../model/data-model';
import { SecurityService } from '../../../../auth/security.service';
import { StatusToString } from '../../../../pipes/status-to-string.pipe';
import { Constants } from '../../../../util/constants';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { RestPage } from '../../../../api/models/RestPage';
import { getErrorMessage } from '../../../../util/functions';
import { enumToArrayList, filtersToParams, TricksService } from '../../../../util/tricks.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Project } from '../../../../api/models/Project';
import { ConfirmationService } from 'primeng/api';
import { dataTableFilter } from '../../util';
import { ActivatedRoute } from '@angular/router';
import isArchived = Project.isArchived;
import { Location } from '../../../../model/data-model';

@Component({
  selector: 'admin-projects',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class AdminProjectsComponent {
  @ViewChild('dt') table: any;
  @ViewChild('target') animationTarget: ElementRef;
  rowsPerPage: Array<number> = [10, 50, 100];
  projects: RestPage<Project> = new RestPage<Project>();
  projectsProcessing = true;
  projectReasons: Array<SelectItem> = [];
  projectStatuses: Array<SelectItem> = [];
  toLocationValidate: Location;
  selectedProject: Project;
  displayLocationDialog: boolean = false;
  displayChangeOwnerDialog: boolean = false;
  displayValidationDialog: boolean = false;
  displayCommentDialog: boolean = false;
  projectValidation: Project.ValidationRequest = {};
  contextMenuItems = [];

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'customer', header: 'Customer', active: true},
    {field: 'serviceType', header: 'Service Type', active: true},
    {field: 'status', header: 'Status', active: true},
    {field: 'reason', header: 'Reason', active: true},
    {field: 'reasonDescription', header: 'Reason Description', active: false},
    {field: 'location', header: 'Location', active: true},
    {field: 'leadPrice', header: 'Lead Price', active: true},
    {field: 'lead', header: 'Is Lead', active: true},
    {field: 'freePositions', header: 'Free Positions', active: false},
    {field: 'startDate', header: 'Start date', active: false},
    {field: 'created', header: 'Created', active: true},
    {field: 'updated', header: 'Updated', active: false},
    {field: 'notes', header: 'Notes', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  filters: { [s: string]: FilterMetadata };

  constructor(public projectService: ProjectService,
              public securityService: SecurityService,
              public popUpMessageService: PopUpMessageService,
              private serviceTypeService: ServiceTypeService,
              private statusToString: StatusToString,
              private constants: Constants,
              private confirmationService: ConfirmationService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public trickService: TricksService,
              private route: ActivatedRoute
  ) {
    this.initContextMenu();
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('id', params['id']);
    });
    this.projectStatuses = enumToArrayList(Project.Status).map(item => {
      return {label: item, value: item};
    });
    this.projectStatuses.unshift({label: 'All', value: ''});
    this.projectReasons = this.trickService.enumToJson(Project.Reason).map(item => {
      return {label: item.label, value: item.value};
    });
    this.projectReasons.unshift({label: 'All', value: ''});
  }

  initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'Add Comment',
        icon: 'fa fa-comments',
        command: () => this.addComment(),
        visible: this.selectedProject && !isArchived(this.selectedProject.status)
      },
      {
        label: 'To Validation',
        icon: 'fa fa-repeat',
        command: () => this.toValidation(),
        visible: this.selectedProject && !isArchived(this.selectedProject.status) && this.selectedProject.status != Project.Status.VALIDATION
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getProjects(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getProjects(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.projectsProcessing = true;
    this.projectService.getAll(filters, pagination).subscribe(projects => {
      this.projects = projects;
      this.projectsProcessing = false;
    }, err => {
      this.popUpMessageService.showError(getErrorMessage(err));
      this.projectsProcessing = false;
    });
  }

  moreInformation(event) {
    let projectId = event.data.id;

    this.projectService.getProject(projectId).subscribe(
      customerProjects => {
        // this.projectInfo = customerProjects;
      },
      err => {
        console.log(err);
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }

  openLocationValidationPopup(): void {
    this.toLocationValidate = {...this.selectedProject.location}; //clone object
    this.displayLocationDialog = true;
  }

  updateLocation(location): void {
    this.projectService.updateLocation(this.selectedProject.id, location).subscribe(
      res => {
        this.refresh();
        this.popUpMessageService.showSuccess('Project location has been updated');
      },
      err => {
        this.popUpMessageService.showError(getErrorMessage(err));
      });
  }

  addComment() {
    this.displayCommentDialog = true;
  }

  toValidation() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      status: Project.Status.VALIDATION
    };
  }

  invalidate() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      status: Project.Status.INVALID,
      reason: this.selectedProject.reason ? this.selectedProject.reason : Project.Reason.INVALID_LOCATION
    };
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Project }): void {
    if (!this.table.expandedRows) {
      this.table.expandedRows = [];
    }
    if (this.table.expandedRows.some(item => item.id == selection.data.id)) {
      this.table.expandedRows = this.table.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.table.expandedRows = [];
      this.projectService.getProject(selection.data.id).subscribe(
        (customerProject: Project) => {
          selection.data.projectRequests = customerProject.projectRequests;
          selection.data.details = customerProject.details;
          selection.data.projectActions = customerProject.projectActions;
          this.table.expandedRows.push(selection.data);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }

}
