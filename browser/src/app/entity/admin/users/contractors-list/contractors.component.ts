import { Component, ViewChild } from '@angular/core';
import { RestPage } from '../../../../api/models/RestPage';
import { AdminContractor } from '../../../../api/models/AdminContractor';
import { FilterMetadata, MenuItem, SelectItem, Table } from 'primeng';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { SecurityService } from '../../../../auth/security.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Pagination } from '../../../../model/data-model';
import { filtersToParams } from '../../../../util/tricks.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../api/services/user.service';
import { dataTableFilter } from '../../util';
import { getErrorMessage } from "../../../../util/functions";
import { Role } from "../../../../model/security-model";

@Component({
  selector: 'contractors',
  templateUrl: './contractors.component.html',
  styleUrls: ['./contractors.component.scss']
})
export class ContractorsComponent {
  @ViewChild('dt') table: Table;
  rowsPerPage: Array<number> = [10, 50, 100];
  contractors: RestPage<AdminContractor> = new RestPage<AdminContractor>();
  processing = true;
  selected: AdminContractor;
  editContractor: AdminContractor;
  displayEditDialog: boolean = false;
  filters: { [s: string]: FilterMetadata };
  Role = Role;


  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'iconUrl', header: 'Icon', active: true},
    {field: 'email', header: 'Email', active: true},
    {field: 'newEmail', header: 'New email', active: false},
    {field: 'displayName', header: 'Display name', active: true},
    {field: 'firstName', header: 'First name', active: false},
    {field: 'LastName', header: 'Last name', active: false},
    {field: 'internalPhone', header: 'Internal phone', active: true},
    {field: 'validationKey', header: 'Validation Key', active: false},
    {field: 'deleted', header: 'Deleted', active: true},
    {field: 'blocked', header: 'Blocked', active: true},
    {field: 'activated', header: 'Activated', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'updated', header: 'Updated', active: true},
    {field: 'lastLogin', header: 'Last login', active: false},
    {field: 'credentialExpired', header: 'Credential Expired', active: false},
    {field: 'nativeUser', header: 'Native User', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [];

  constructor(public securityService: SecurityService,
              public popUpService: PopUpMessageService,
              private userService: UserService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private router: Router,
              private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('email', params['email']);
    });
  }

  initContextMenu () {
    this.contextMenuItems = [
      {
        label: this.securityService.hasRole(Role.ADMIN) ? 'Edit' : "View",
        icon: this.securityService.hasRole(Role.ADMIN) ? 'fa fa-pencil' : 'fas fa-eye',
        command: () => this.edit(this.selected)
      },
      {
        label: 'Show company',
        icon: 'fa fa-search',
        command: () => this.moveToCompany(this.selected)
      },
      {
        label: 'Show project requests',
        icon: 'fa fa-search',
        command: () => this.moveToProjectRequests(this.selected)
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getContractors(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  selectItem(selection: { originalEvent: MouseEvent, data: AdminContractor }): void {
    this.selected = selection.data;
    this.initContextMenu();
  }

  edit(contractor: AdminContractor): void {
    this.displayEditDialog = true;
    this.editContractor = {...{}, ...contractor}; //clone object
  }

  moveToCompany(contractor: AdminContractor): void {
    this.router.navigate(['admin', 'companies'], {queryParams: {id: contractor.company.id}});
  }

  moveToProjectRequests(contractor: AdminContractor): void {
    this.router.navigate(['admin', 'project-requests'], {queryParams: {pro: contractor.email}});
  }

  getContractors(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.userService.getAllContractors(filters, pagination).subscribe(
      (restPage: RestPage<AdminContractor>) => {
        this.processing = false;
        this.contractors = restPage;
      }, err => {
        this.processing = false;
      }
    );
  }

  updateContractor(contractor: AdminContractor): void {
    this.userService.updateContractor(contractor.id, contractor).subscribe(res => {
      this.popUpService.showSuccess(`<b>${contractor.displayName}</b> has been updated`);
      this.displayEditDialog = false;
      this.refresh();
    }, err => {
      this.popUpService.showError(getErrorMessage(err))
    });
  }
}
