import { Component, ElementRef, ViewChild } from '@angular/core';
import { Location, Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { MenuItem } from 'primeng/api';
import { ProjectService } from '../../../../api/services/project.service';
import { SecurityService } from '../../../../auth/security.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';
import { Project } from '../../../../api/models/Project';
import { SelectItem } from "primeng";
import { CamelCaseHumanPipe } from "../../../../pipes/camelcase-to-human.pipe";
import { enumToArrayList, filtersToParams } from "../../../../util/tricks.service";

@Component({
  selector: 'projects-validation',
  templateUrl: './projects-validation.component.html',
  styleUrls: ['./projects-validation.component.scss']
})
export class AdminProjectsValidationComponent {
  @ViewChild('dt') table: any;
  @ViewChild('target') animationTarget: ElementRef;
  rowsPerPage: Array<number> = [10, 50, 100];
  projects: RestPage<Project> = new RestPage<Project>();
  projectsProcessing = true;
  fetching: boolean = true;
  projectRequests;
  projectReasons: Array<SelectItem> = [];
  projectStatusesFilter: Array<SelectItem> = [];
  projectInfo;
  toLocationValidate: Location;
  selectedProject: Project;
  displayLocationDialog: boolean = false;
  displayChangeOwnerDialog: boolean = false;
  displayValidationDialog: boolean = false;
  displayCommentDialog: boolean = false;
  displayCancelDialog: boolean = false;
  displayCompleteDialog: boolean = false;
  projectValidation: Project.ValidationRequest = {};

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

  tabIndex = 0;
  contextMenuItems: Array<MenuItem> = [];

  constructor(public projectService: ProjectService,
              public securityService: SecurityService,
              public popUpMessageService: PopUpMessageService,
              public camelCaseHumanPipe: CamelCaseHumanPipe) {
    this.initContextMenu();
    this.projectStatusesFilter = enumToArrayList(Project.Status).map(item => {
      return {label: item, value: item};
    });
    this.projectStatusesFilter.unshift({label: 'All', value: ''});
    this.projectReasons = enumToArrayList(Project.SystemReason).map(item => {
      return {label: item, value: item};
    });
    this.projectReasons.unshift({label: 'All', value: ''});
  }

  initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'Update Location',
        icon: 'fa fa-map-marker',
        command: () => this.openLocationValidationPopup(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION && !this.selectedProject.hasProjectRequests
      },
      {
        label: 'Add Comment',
        icon: 'fa fa-comments',
        command: () => this.addComment(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION
      },
      {
        label: 'Validate',
        icon: 'fas fa-clipboard-check',
        command: () => this.validate(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION
      },
      {
        label: 'Invalidate',
        icon: 'fa fa-minus-circle',
        command: () => this.invalidate(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION,
        styleClass: 'danger-menu-button'
      },
      {
        label: 'Cancel',
        icon: 'fas fa-ban',
        command: () => this.cancel(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION,
        styleClass: 'danger-menu-button'
      },
      {
        label: 'Complete',
        icon: 'fas fa-check-circle',
        command: () => this.complete(),
        visible: this.selectedProject && this.selectedProject.status == Project.Status.VALIDATION,
      }
    ]
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


  getProjects(filters, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])) {
    this.projectsProcessing = true;
    filters.status = Project.Status.VALIDATION;
    this.projectService.getAll(filters, pagination).subscribe(projects => {
      this.fetching = false;
      this.projects = projects;
      this.projectsProcessing = false;
    }, err => {
      console.error(err);
      this.fetching = false;
      this.popUpMessageService.showError(getErrorMessage(err));
      this.projectsProcessing = false;
    });
  }

  openLocationValidationPopup(): void {
    this.toLocationValidate = {...this.selectedProject.location}; //clone object
    this.displayLocationDialog = true;
  }

  updateLocation(location: Location): void {
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

  invalidate() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      status: Project.Status.INVALID,
      reason: this.selectedProject.reason ? this.selectedProject.reason : Project.Reason.INVALID_LOCATION
    }
  }

  validate() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      status: this.selectedProject.hasProjectRequests ? Project.Status.IN_PROGRESS : Project.Status.ACTIVE,
      reason: this.selectedProject.reason
    }
  }

  cancel() {
    this.displayCancelDialog = true;
  }

  complete() {
    this.displayCompleteDialog = true;
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
          console.error(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }
}
