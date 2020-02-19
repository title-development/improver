import { Component, ViewChild } from '@angular/core';
import { Pagination, Review } from '../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng';
import { enumToArrayList, filtersToParams } from '../../../util/tricks.service';
import { RestPage } from '../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { StaffAction } from "../../../api/models/StaffAction";
import { StaffService } from "../../../api/services/staff.service";
import { Role } from "../../../model/security-model";
import { SecurityService } from "../../../auth/security.service";

@Component({
  selector: 'staff-actions',
  templateUrl: './staff-actions.component.html',
  styleUrls: ['./staff-actions.component.scss']
})
export class StaffActionsComponent {
  @ViewChild('dt') table: any;
  processing = true;
  staffActions: RestPage<StaffAction> = new RestPage<StaffAction>();
  rowsPerPage: Array<number> = [10, 50, 100];
  selected: StaffAction;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'description', header: 'Description', active: true},
    {field: 'author', header: 'Author', active: true},
    {field: 'authorRole', header: 'Author Role', active: true},
    {field: 'action', header: 'Action', active: true},
    {field: 'created', header: 'Created', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [];
  filters: any;
  actions: Array<SelectItem> = [];
  roles: Array<SelectItem> = [];

  constructor(private staffService: StaffService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              private router: Router,
              private securityService: SecurityService) {
    this.actions = enumToArrayList(StaffAction.Action)
      .map(item => {
        return {label: item, value: item};
      });
    this.actions.unshift({label: 'All', value: ''});
    this.roles = Role.getStaff()
      .map(item => {
        return {label: item, value: item};
      });
    this.roles.unshift({label: 'All', value: ''});
    this.initContextMenu();
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getStaffActions(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  initContextMenu() {
    this.contextMenuItems =[
      {
        label: 'View author',
        icon: 'fa fa-building',
        command: () => this.moveToUsers(this.selected)
      },
    ];
  }

  getStaffActions(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.staffService.getAllActions(filters, pagination).subscribe(
      (restPage: RestPage<Review>) => {
        this.processing = false;
        this.staffActions = restPage;
      }, err => {
        this.processing = false;
      });
  }

  moveToUsers(action: StaffAction): void {
    this.router.navigate(['admin', 'users'], {queryParams: {email: action.author}});
  }


}
