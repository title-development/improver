import { Component, ViewChild } from '@angular/core';
import { Pagination, Review } from '../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng/primeng';
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
  @ViewChild('dt') dataTable: any;
  processing = true;
  staffActions: RestPage<StaffAction> = new RestPage<StaffAction>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
  selected: StaffAction;
  selectedTableCols: Array<string> = [
    'id',
    'description',
    'author',
    'authorRole',
    'action',
    'created',
  ];
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

  initContextMenu() {
    this.contextMenuItems =[
      {
        label: 'View author',
        icon: 'fa fa-building',
        command: () => this.moveToUsers(this.selected)
      },
    ];
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
    this.getStaffActions(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectItem(selection: { originalEvent: MouseEvent, data: Review }): void {
    this.selected = selection.data;
    this.initContextMenu();
  }

  getStaffActions(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.staffService.getAllActions(filters, pagination).subscribe(
      (restPage: RestPage<Review>) => {
        this.processing = false;
        this.staffActions = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
      });
  }

  moveToUsers(action: StaffAction): void {
    this.router.navigate(['admin', 'users'], {queryParams: {email: action.author}});
  }


}
