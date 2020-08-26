import { Component, ViewChild } from '@angular/core';
import { AdminContractor } from '../../../../api/models/AdminContractor';
import { RestPage } from '../../../../api/models/RestPage';
import { FilterMetadata, MenuItem, SelectItem, Table } from 'primeng';
import { Pagination } from '../../../../model/data-model';
import { filtersToParams } from '../../../../api/services/tricks.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../../auth/security.service';
import { PopUpMessageService } from '../../../../api/services/pop-up-message.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { UserService } from '../../../../api/services/user.service';
import { User } from '../../../../api/models/User';
import { dataTableFilter } from '../../util';
import { getErrorMessage } from "../../../../util/functions";
import { Role } from "../../../../model/security-model";

@Component({
  selector: 'customers',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent {
  @ViewChild('dt') table: Table;
  rowsPerPage: Array<number> = [10, 50, 100];
  customers: RestPage<AdminContractor> = new RestPage<AdminContractor>();
  processing = true;
  tableColumns: Array<SelectItem> = [];
  selected: User;
  editCustomer: User;
  displayEditDialog: boolean = false;
  filters: { [s: string]: FilterMetadata } = {};
  contextMenuItems: Array<MenuItem> = [];
  Role = Role;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'iconUrl', header: 'Icon', active: true},
    {field: 'email', header: 'Email', active: true},
    {field: 'displayName', header: 'Display name', active: true},
    {field: 'firstName', header: 'First name', active: false},
    {field: 'lastName', header: 'Last name', active: false},
    {field: 'internalPhone', header: 'Internal phone', active: true},
    {field: 'isDeleted', header: 'Deleted', active: true},
    {field: 'isBlocked', header: 'Blocked', active: true},
    {field: 'isActivated', header: 'Activated', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'updated', header: 'Updated', active: true},
    {field: 'lastLogin', header: 'Last login', active: false},
    {field: 'isNativeUser', header: 'Native User', active: false},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  constructor(public securityService: SecurityService,
              public popUpService: PopUpMessageService,
              private userService: UserService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private router: Router,
              private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      Object.assign(this.filters, dataTableFilter('email', params['email']));
      Object.assign(this.filters, dataTableFilter('id', params['id']));
    });
  }

  initContextMenu () {
    this.contextMenuItems = [
      {
        label: this.securityService.hasRole(Role.ADMIN) ? 'Edit' : "View",
        icon: this.securityService.hasRole(Role.ADMIN) ? 'fa fa-pencil' : 'fas fa-eye',
        command: () => this.edit(this.selected)
      }
    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getCustomers(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getCustomers(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.userService.getAllCustomers(filters, pagination).subscribe(
      (restPage: RestPage<AdminContractor>) => {
        this.processing = false;
        this.customers = restPage;
      }, err => {
        this.processing = false;
      }
    );
  }

  selectItem(selection: { originalEvent: MouseEvent, data: AdminContractor }): void {
    this.selected = selection.data;
    this.initContextMenu();
  }

  edit(customer: User): void {
    this.displayEditDialog = true;
    this.editCustomer = {...{}, ...customer}; //clone object
  }

  updateCustomers(customer: User): void {
    this.userService.updateCustomers(customer.id, customer).subscribe(res => {
      this.popUpService.showSuccess(`<b>${customer.displayName}</b> has been updated`);
      this.displayEditDialog = false;
      this.refresh();
    }, err => {
      this.popUpService.showError(`Could not updated user. ${getErrorMessage(err)}`);
    });
  }
}
