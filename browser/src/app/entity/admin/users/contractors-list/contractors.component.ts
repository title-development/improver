import { Component, ViewChild } from '@angular/core';
import { RestPage } from '../../../../api/models/RestPage';
import { AdminContractor } from '../../../../api/models/AdminContractor';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { SecurityService } from '../../../../auth/security.service';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Pagination } from '../../../../model/data-model';
import { filtersToParams } from '../../../../util/tricks.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/components/common/messageservice';
import { UserService } from '../../../../api/services/user.service';
import { dataTableFilter } from '../../util';
import { FilterMetadata } from 'primeng/components/common/filtermetadata';
import { getErrorMessage } from "../../../../util/functions";

@Component({
  selector: 'contractors',
  templateUrl: './contractors.component.html',
  styleUrls: ['./contractors.component.scss']
})
export class ContractorsComponent {
  @ViewChild('dt') dataTable: any;
  rowsPerPage: Array<number> = [10, 50, 100];
  contractors: RestPage<AdminContractor> = new RestPage<AdminContractor>();
  processing = true;
  tableColumns: Array<SelectItem> = [];
  selected: AdminContractor;
  editContractor: AdminContractor;
  displayEditDialog: boolean = false;
  filters: { [s: string]: FilterMetadata };
  selectedTableCols: Array<string> = [
    'id',
    'email',
    'displayName',
    'activated',
    'blocked',
    'deleted',
    'created'
  ];

  contextMenuItems: Array<MenuItem> = [
    {
      label: 'Edit',
      icon: 'fa fa-edit',
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

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  loadLazy(event): void {
    this.getProjects(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectItem(selection: { originalEvent: MouseEvent, data: AdminContractor }): void {
    this.selected = selection.data;
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

  getProjects(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.userService.getAllContractors(filters, pagination).subscribe(
      (restPage: RestPage<AdminContractor>) => {
        this.processing = false;
        this.contractors = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(item => !(item == 'role' || item == 'refreshId' || item == 'projectRequests' || item == 'validationKey' || item == 'newEmail' || item == 'socialConnections' || item == 'notifications' ||  item == 'nativeUser')  )
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
