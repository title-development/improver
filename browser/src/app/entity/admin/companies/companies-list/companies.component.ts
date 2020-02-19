import { Component, ViewChild } from '@angular/core';
import { ConfirmationService, Table, MenuItem, SelectItem, FilterMetadata } from 'primeng';
import { CompanyService } from '../../../../api/services/company.service';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { Role } from '../../../../model/security-model';
import { Company } from '../../../../api/models/Company';
import { Location, Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { Constants } from '../../../../util/constants';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { dataTableFilter } from '../../util';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../../../api/models/Project';
import { SecurityService } from "../../../../auth/security.service";
import { BillingService } from "../../../../api/services/billing.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";

@Component({
  selector: 'admin-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.scss']
})
export class CompaniesComponent {

  @ViewChild('dt') table: Table;
  rowsPerPage: Array<number> = [10, 50, 100];
  companiesPage: RestPage<Company> = new RestPage<Company>();
  selectedCompany: Company;
  displayEditDialog: boolean = false;
  fetching: boolean = true;
  states: Array<SelectItem> = [];
  accreditations: Array<SelectItem> = [];
  Role = Role;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'iconUrl', header: 'Icon', active: true},
    {field: 'backgroundUrl', header: 'Background', active: false},
    {field: 'name', header: 'Name', active: true},
    {field: 'location', header: 'Location', active: true},
    {field: 'description', header: 'Description', active: false},
    {field: 'founded', header: 'founded', active: false},
    {field: 'siteUrl', header: 'Site Url', active: false},
    {field: 'rating', header: 'Rating', active: false},
    {field: 'approved', header: 'Approved', active: true},
    {field: 'uri', header: 'Uri', active: false},
    {field: 'created', header: 'Created', active: false},
    {field: 'deleted', header: 'Deleted', active: false},
    {field: 'balance', header: 'Balance', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  roles: Array<SelectItem> = [];
  displayLocationDialog: boolean = false;
  displayBonusDialog: boolean = false;
  toLocationValidate: Location;

  contextMenuItems: Array<MenuItem> = [];
  newIcon: String;
  newCoverImage: File;
  bonus: number = 0;
  filters: { [s: string]: FilterMetadata };

  constructor(private companyService: CompanyService,
              private confirmationService: ConfirmationService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public constants: Constants,
              private route: ActivatedRoute,
              public securityService: SecurityService,
              private billingService: BillingService,
              private popUpService: PopUpMessageService) {
    this.route.queryParams.subscribe(params => {
      this.filters = dataTableFilter('id', params['id']);
    });
    this.states = this.constants.states.map(item => {
      return {
        label: item.label,
        value: item.label
      };
    });

    this.roles = enumToArrayList(Role).map(item => {
      return {label: item, value: item};
    });

  }

  initContextMenu () {
    this.contextMenuItems = [
      {
        label: this.securityService.hasRole(Role.ADMIN) ? 'Edit' : "View",
        icon: this.securityService.hasRole(Role.ADMIN) ? 'fa fa-pencil' : 'fas fa-eye',
        command: () => this.editCompany()
      },
      {
        label: 'Update Location',
        icon: 'fa fa-map-marker',
        visible: this.securityService.hasRole(Role.ADMIN),
        command: () => this.openLocationValidationPopup()
      },
      {
        label: 'Add Bonus',
        icon: 'fa fa-money',
        visible: this.securityService.hasRole(Role.ADMIN),
        command: () => {this.displayBonusDialog = true}
      },
      {
        label: 'Approve',
        icon: 'fas fa-thumbs-up',
        visible: !this.selectedCompany.approved,
        command: () => this.approve()
      },
      {
        label: 'Disapprove',
        icon: 'fas fa-thumbs-down',
        visible: this.selectedCompany.approved,
        command: () => this.disapprove()
      },

    ];
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getCompanies(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getCompanies(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.fetching = true;
    this.companyService.getCompanies(filters, pagination).subscribe((companies: RestPage<Company>) => {
      this.fetching = false;
      this.companiesPage = companies;
    });
  }

  deleteCompanyLogo(): void {
    this.companyService.deleteLogo(this.selectedCompany.id).subscribe(res => {
    }, err => {
      this.popUpService.showError(`Could not delete company logo. ${getErrorMessage(err)}`);
    })
  }

  deleteCompanyCover(): void {
    this.companyService.deleteCover(this.selectedCompany.id).subscribe(res => {
      this.popUpService.showSuccess(`Company cover has been deleted`);
    }, err => {
      this.popUpService.showError(`Could not delete company cover. ${getErrorMessage(err)}`);
    })
  }

  editCompany(): void {
    this.displayEditDialog = true;
  }

  closeDialog() {
    this.selectedCompany = null;
  }

  save(): void {
    const formData = new FormData();

    if (this.newIcon) {
      formData.append('icon', this.newIcon.toString());
    }
    if (this.newCoverImage) {
      formData.append('coverImage', this.newCoverImage);
    }
    formData.append('data', JSON.stringify(this.selectedCompany));
    this.companyService.updateCompany(this.selectedCompany.id, formData).subscribe(
      res => {
        this.getCompanies();
        this.displayEditDialog = false;
        this.selectedCompany = null;
      }, error => {
        this.displayEditDialog = false;
        this.selectedCompany = null;
      }
    );
  }

  openLocationValidationPopup(): void {
    this.displayLocationDialog = true;
    this.toLocationValidate = {...this.selectedCompany.location};
  }

  updateLocation(location: Location): void {
    this.companyService.updateLocation(this.selectedCompany.id, location).subscribe(
      res => {
        this.refresh();
        this.popUpService.showSuccess(`Company location has been updated`);
      }, err => {
        this.popUpService.showError(`Could not update company location. ${getErrorMessage(err)}`);
      });
  }

  deleteLicense(index): void {
    this.selectedCompany.licenses.splice(index, 1);
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Project }): void {
    console.log("selection", selection);
    console.log("this.table", this.table.selectionKeys)
    // if (!this.dataTable.expandedRows) {
    //   this.dataTable.expandedRows = [];
    // }
    // if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
    //   this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    // } else {
    //   this.dataTable.expandedRows = [];
    //   this.dataTable.expandedRows.push(selection.data);
    // }
  }

  addBonus() {
    this.billingService.addBonus(this.selectedCompany.id, parseInt(this.bonus.toString()) * 100).subscribe(() => {
        this.displayBonusDialog = false;
        this.popUpService.showSuccess(`${this.bonus} was added as bonus to <b>${this.selectedCompany.name}</b> account`);
        this.bonus = 0;
        this.selectedCompany = null;
        this.getCompanies();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err));
      });
  }

  approve() {
    this.confirmationService.confirm({
      header: 'Approve company',
      icon: 'fa fa-question-circle',
      message: `Do you want to approve <b>${this.selectedCompany.name}</b>`,
      accept: () => {
        console.log("Approving " + this.selectedCompany.name);
        this.companyService.approve(this.selectedCompany.id, true).subscribe(
          response => {
            this.getCompanies();
            this.popUpService.showSuccess(`<b>${this.selectedCompany.name}</b> is approved`)
          },
          err => {
            this.popUpService.showError(getErrorMessage(err))
          }
        );
      }
    });

  }

  disapprove() {
    this.confirmationService.confirm({
      header: 'Disapprove company',
      icon: 'fa fa-question-circle',
      message: `Do you want to disapprove <b>${this.selectedCompany.name}</b>`,
      accept: () => {
        this.companyService.approve(this.selectedCompany.id, false).subscribe(
          response => {
            this.getCompanies();
            this.popUpService.showSuccess(`<b>${this.selectedCompany.name}</b> is disapproved`)
          },
          err => {
            this.popUpService.showError(getErrorMessage(err))
          }
        );
      }
    });
  }



}
