import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ProjectService } from '../../../../api/services/project.service';
import { SecurityService } from '../../../../auth/security.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { StatusToString } from '../../../../pipes/status-to-string.pipe';
import { Constants } from '../../../../util/constants';
import { LocationValidateService } from '../../../../api/services/location-validate.service';
import { getErrorMessage } from '../../../../util/functions';
import { Project } from '../../../../api/models/Project';
import { DataTable, SelectItem } from "primeng/primeng";
import { CamelCaseHumanPipe } from "../../../../pipes/camelcase-to-human.pipe";
import { enumToArrayList, filtersToParams, TricksService } from "../../../../util/tricks.service";
import { ScrollHolderService } from '../../../../util/scroll-holder.service';

@Component({
  selector: 'projects-validation',
  templateUrl: './projects-validation.component.html',
  styleUrls: ['./projects-validation.component.scss']
})
export class AdminProjectsValidationComponent {
  @ViewChild('dt') dataTable: any;
  @ViewChild('target') animationTarget: ElementRef;
  SystemMessageType = this.SystemMessageType;
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
  projectValidation: Project.ValidationRequest = {};
  tableColumns: Array<SelectItem> = [];
  selectedTableCols: Array<string> = [
    'id',
    'customer',
    'serviceType',
    'reason',
    'lead',
    'status',
    'leadPrice',
    'location',
    'created'
  ];
  projectTabs = [
    {
      header: 'Validation',
      content: this.getProjects(true, {})
    },
    {
      header: 'Invalid',
      content: this.getProjects(false, {})
    }
  ];
  tabIndex = 0;
  contextMenuItems: Array<MenuItem> = [];
  createdContextMenuItems: Array<MenuItem> = [
    {
      label: 'Update Location',
      icon: 'fa fa-map-marker',
      command: () => this.openLocationValidationPopup()
    },
    // {
    //   label: 'Change Owner',
    //   icon: 'fa fa-user',
    //   command: () => this.changeOwner()
    // },
    {
      label: 'Add Comment',
      icon: 'fa fa-comments',
      command: () => this.addComment()
    },
    {
      label: 'Validate',
      icon: 'fa fa-check-circle',
      command: () => this.validate()
    },
    {
      label: 'Invalidate',
      icon: 'fa fa-minus-circle',
      command: () => this.invalidate()
    }
  ];

  constructor(public projectService: ProjectService,
              public securityService: SecurityService,
              public popUpMessageService: PopUpMessageService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public trickService: TricksService,
              private confirmationService: ConfirmationService,
              private serviceTypeService: ServiceTypeService,
              private statusToString: StatusToString,
              private constants: Constants,
              private locationValidateService: LocationValidateService,
              public scrollHolderService: ScrollHolderService) {
    this.projectStatusesFilter = enumToArrayList(Project.Status).map(item => {
      return {label: item, value: item};
    });
    this.projectStatusesFilter.unshift({label: 'All', value: ''});
    this.projectReasons = enumToArrayList(Project.SystemReason).map(item => {
      return {label: item, value: item};
    });
    this.projectReasons.unshift({label: 'All', value: ''});
  }


  getProjects(isValid, filters, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])) {
    this.projectsProcessing = true;
      filters.status = 'VALIDATION';
    this.projectService.getAll(filters, pagination).subscribe(projects => {
      this.fetching = false;
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
      console.log(err);
      this.fetching = false;
      this.popUpMessageService.showError(getErrorMessage(err));
      this.projectsProcessing = false;
    });
  }

  handleChange(e) {
    this.tabIndex = e.index;
    this.getProjects(this.tabIndex == 0, {});
  }

  loadProjectsLazy(event) {
    const filters = filtersToParams(event.filters);
    const pagination = new Pagination().fromPrimeNg(event);
    this.getProjects(this.tabIndex == 0, filters, pagination);
  }

  selectProject(selection: { originalEvent: MouseEvent, data: any }): void {
    this.selectedProject = selection.data;
    this.contextMenuItems = this.createdContextMenuItems;
  }

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
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
      resolution: Project.Status.INVALID,
      reason: this.selectedProject.reason ? this.selectedProject.reason : Project.Reason.INVALID_LOCATION
    }
  }

  validate() {
    this.displayValidationDialog = true;
    this.projectValidation = {
      resolution: Project.Status.ACTIVE,
      reason: this.selectedProject.reason
    }
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
