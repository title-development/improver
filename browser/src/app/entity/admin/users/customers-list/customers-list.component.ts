import { Component, ViewChild } from '@angular/core';
import { AdminContractor } from '../../../../api/models/AdminContractor';
import { RestPage } from '../../../../api/models/RestPage';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { Pagination } from '../../../../model/data-model';
import { filtersToParams } from '../../../../util/tricks.service';
import { MessageService } from 'primeng/components/common/messageservice';
import { ActivatedRoute, Router } from '@angular/router';
import { SecurityService } from '../../../../auth/security.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { UserService } from '../../../../api/services/user.service';
import { User } from '../../../../api/models/User';
import { dataTableFilter } from '../../util';
import { FilterMetadata } from 'primeng/components/common/filtermetadata';
import { getErrorMessage } from "../../../../util/functions";
import { Role } from "../../../../model/security-model";

@Component({
  selector: 'customers',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.scss']
})
export class CustomersListComponent {
  @ViewChild('dt') dataTable: any;
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
  selectedTableCols: Array<string> = [
    'id',
    'email',
    'displayName',
    'activated',
    'blocked',
    'deleted',
    'created'
  ];

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

  loadLazy(event): void {
    this.getCustomers(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  getCustomers(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.userService.getAllCustomers(filters, pagination).subscribe(
      (restPage: RestPage<AdminContractor>) => {
        this.processing = false;
        this.customers = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(item => !(item == 'role' || item == 'refreshId' || item == 'projectRequests' || item == 'validationKey' || item == 'newEmail' || item == 'mailSettings' || item == 'socialConnections' || item == 'notifications' || item == 'nativeUser'))
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
      }
    );
  }

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
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
