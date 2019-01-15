import { Component, ViewChild } from '@angular/core';
import { LicenseType, Pagination, State } from '../../../model/data-model';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/primeng';
import { filtersToParams, TricksService } from '../../../util/tricks.service';
import { RestPage } from '../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { LicenseTypeService } from "../../../api/services/license-type.service";
import { PopUpMessageService } from "../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../util/functions";
import { SecurityService } from "../../../auth/security.service";
import { Role } from '../../../model/security-model';
import { Constants } from "../../../util/constants";

@Component({
  selector: 'admin-license-types',
  templateUrl: './license-types.component.html',
  styleUrls: ['./license-types.component.scss']
})
export class LicenseTypesComponent {
  @ViewChild('dt') dataTable: any;
  states: [] = [];
  Role = Role;
  processing = true;
  licenseType: LicenseType = new LicenseType();
  licenseTypes: RestPage<LicenseType> = new RestPage<LicenseType>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
  selected: LicenseType;
  displayAddLicenseTypeDialog = false;
  selectedTableCols: Array<string> = [
    'id',
    'state',
    'accreditation'
  ];
  contextMenuItems: Array<MenuItem> = [
    {
      label: 'Delete',
      icon: 'fa fa-trash',
      visible: this.securityService.hasRole(Role.ADMIN),
      command: () => this.delete(this.selected)
    }
  ];
  filters: any;

  constructor(private licenseTypeService: LicenseTypeService,
              private popUpService: PopUpMessageService,
              public securityService: SecurityService,
              private tricksService: TricksService,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public confirmationService: ConfirmationService,
              public constants: Constants,
              private router: Router) {
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
    this.getAll(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectItem(selection: { originalEvent: MouseEvent, data: LicenseType }): void {
    this.selected = selection.data;
  }

  getAll(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    this.licenseTypeService.getAll(filters, pagination).subscribe(
      (restPage) => {
        this.processing = false;
        this.licenseTypes = restPage;
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

  create(form): void {
    this.licenseTypeService.post(this.licenseType).subscribe(
      response => {
        this.popUpService.showSuccess(`License Type created`);
        this.refresh();
        this.displayAddLicenseTypeDialog = false;
        form.resetForm();
        setTimeout(() => {
          this.licenseType = new LicenseType();
        }, 300)
      },
      err => this.popUpService.showError(getErrorMessage(err))
    )
  }

  delete(licenseType: LicenseType): void {
    this.confirmationService.confirm({
      header: 'Delete License Type',
      message: 'Are you sure you want to delete this Licence Type?',
      icon: 'fa fa-trash',
      accept: () => {
        this.licenseTypeService.delete(licenseType.id).subscribe(
          response => {
            this.popUpService.showSuccess(`License type deleted`);
            this.refresh()
          },
          err => this.popUpService.showError(getErrorMessage(err))
        )
      }
    });
  }

  onDialogClose(form) {
    form.resetForm();
    setTimeout(() => {
      this.licenseType = new LicenseType();
    }, 300)
  }

}


