import { Component, ElementRef, ViewChild } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { ProjectService } from '../../../../api/services/project.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { Pagination, SystemMessageType } from '../../../../model/data-model';
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
import { FilterMetadata } from 'primeng/components/common/filtermetadata';

@Component({
  selector: 'admin-projects',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss']
})
export class AdminProjectsComponent {
  @ViewChild('dt') dataTable: any;
  @ViewChild('target') animationTarget: ElementRef;
  rowsPerPage: Array<number> = [10, 50, 100];
  projects: RestPage<Project> = new RestPage<Project>();
  projectsProcessing = true;
  projectReasons: Array<SelectItem> = [];
  projectStatusesFilter: Array<SelectItem> = [];
  toLocationValidate: Location;
  selectedProject: Project;
  displayLocationDialog: boolean = false;
  displayChangeOwnerDialog: boolean = false;
  displayValidationDialog: boolean = false;
  displayCommentDialog: boolean = false;
  projectValidation: Project.ValidationRequest = {};
  defaultContextMenuItems: Array<MenuItem> = [
    {
      label: 'Update Location',
      icon: 'fa fa-map-marker',
      command: () => this.openLocationValidationPopup()
    },
    {
      label: 'Add Comment',
      icon: 'fa fa-comments',
      command: () => this.addComment()
    },
    {
      label: 'To Validation',
      icon: 'fa fa-repeat',
      command: () => this.toValidation()
    },
    {
      label: 'Invalidate',
      icon: 'fa fa-minus-circle',
      command: () => this.invalidate()
    }
  ];

  contextMenuItems = [];

  tableColumns: Array<SelectItem> = [];
  selectedTableCols: Array<string> = [
    'id',
    'customer',
    'serviceType',
    'status',
    'reason',
    'location',
    'leadPrice',
    'lead',
    'created'
  ];

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
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('id', params['id']);
    });
    this.projectStatusesFilter = enumToArrayList(Project.Status).map(item => {
      return {label: item, value: item};
    });
    this.projectStatusesFilter.unshift({label: 'All', value: ''});
    this.projectReasons = this.trickService.enumToJson(Project.Reason).map(item => {
      return {label: item.label, value: item.value};
    });
    this.projectReasons.unshift({label: 'All', value: ''});
  }

  getProjects(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.projectsProcessing = true;
    this.projectService.getAll(filters, pagination).subscribe(projects => {
      this.projects = projects;
      this.projectsProcessing = false;
      if (projects.content.length > 0) {
        this.tableColumns = [...this.selectedTableCols, ...Object.keys(projects.content[0])]
          .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
          .filter(item => !(item == 'details' || item == 'projectActions' || item == 'projectRequests'))
          .map(key => {
              return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
            }
          );
      }
    }, err => {
      this.popUpMessageService.showError(getErrorMessage(err));
      this.projectsProcessing = false;
    });
  }

  loadProjectsLazy(event): void {
    this.getProjects(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  selectProject(selection: { originalEvent: MouseEvent, data: any }): void {
    this.selectedProject = selection.data;
    this.contextMenuItems = this.defaultContextMenuItems.filter(item => {
      let pass = true;
      if (this.selectedProject.status == Project.Status.VALIDATION) {
        pass = item.label != 'To Validation';
      } else if (this.selectedProject.status == Project.Status.INVALID) {
        pass = (item.label != 'Update Location') &&
          (item.label != 'Change Owner') &&
          (item.label != 'To Validation') &&
          (item.label != 'Invalidate');
      }
      return pass;
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

  updateLocation(location: Location): void {
    this.projectService.updateLocation(this.selectedProject.id, location).subscribe(
      res => {
        this.refresh();
        this.popUpMessageService.showSuccess('`Project location has been updated');
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
      resolution: Project.Status.VALIDATION,
      reason: Project.Reason.INVALID_LOCATION
    };
  }

  invalidate() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      resolution: Project.Status.INVALID,
      reason: this.selectedProject.reason ? this.selectedProject.reason : Project.Reason.INVALID_LOCATION
    };
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Project }): void {
    if (!this.dataTable.expandedRows) {
      this.dataTable.expandedRows = [];
    }
    if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
      this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.dataTable.expandedRows = [];
      this.projectService.getProject(selection.data.id).subscribe(
        (customerProject: Project) => {
          selection.data.projectRequests = customerProject.projectRequests;
          selection.data.details = customerProject.details;
          selection.data.projectActions = customerProject.projectActions;
          this.dataTable.expandedRows.push(selection.data);
        },
        err => {
          console.log(err);
          this.popUpMessageService.showError(getErrorMessage(err));
        });
    }
  }

}
