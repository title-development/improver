import { Component, ViewChild } from '@angular/core';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { ConfirmationService, DataTable, FilterMetadata, MenuItem, OverlayPanel } from 'primeng/primeng';
import { Router } from '@angular/router';
import { ErrorHandler } from '../../../../util/error-handler';
import { ServiceTypeService } from '../../../../api/services/service-type.service';
import { AdminServiceType } from '../../../../api/models/AdminServiceType';
import { filtersToParams } from '../../../../util/tricks.service';
import { PopUpMessageService } from '../../../../util/pop-up-message.service';
import { getErrorMessage } from '../../../../util/functions';
import { Role } from '../../../../model/security-model';
import { SecurityService } from '../../../../auth/security.service';

@Component({
  selector: 'services-list',
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent {
  @ViewChild('dt') dataTable: any;
  selectedService: AdminServiceType;
  fetching: boolean = true;
  filters: { [s: string]: FilterMetadata } = {};
  services: RestPage<AdminServiceType> = new RestPage<AdminServiceType>();
  rowsPerPage: Array<number> = [10, 50, 100];
  ratingTimeout;
  maxRatingValue: number = 100;
  minRatingValue: number = 0;
  ratingFilter: Array<number> = [this.minRatingValue, this.maxRatingValue];
  priceTimeout;
  maxPriceValue: number = 200;
  minPriceValue: number = 0;
  priceFilter: Array<number> = [this.minPriceValue, this.maxPriceValue];
  Role = Role;
  contextMenuItems: Array<MenuItem> = [
    {
      label: 'View',
      icon: 'fa fa-eye',
      command: () => this.router.navigate(['admin', 'services', 'view', this.selectedService.id]),
      visible: this.securityService.hasRole(Role.SUPPORT)
    },
    {
      label: 'Edit',
      icon: 'fa fa-pencil',
      command: () => this.router.navigate(['admin', 'services', 'edit', this.selectedService.id]),
      visible: this.securityService.hasRole(Role.ADMIN)
    },
    {
      label: 'Delete',
      icon: 'fa fa-trash',
      command: () => this.deleteService(this.selectedService),
      visible: this.securityService.hasRole(Role.ADMIN)
    }
  ];

  constructor(private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
              private confirmationService: ConfirmationService,
              private router: Router,
              public securityService: SecurityService,
              private errorHandler: ErrorHandler) {
  }

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
  }

  getServices(filters: any = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.serviceTypeService.getAll(filters, pagination).subscribe((services: RestPage<AdminServiceType>) => {
        this.fetching = false;
        this.services = services;
      },
      err => this.fetching = false
    );
  }

  loadServicesLazy(event): void {
    const filters = filtersToParams(event.filters);
    this.getServices(filters, new Pagination().fromPrimeNg(event));
  }

  selectService(selection: { originalEvent: MouseEvent, data: AdminServiceType }): void {
    this.selectedService = selection.data;
  }

  showServiceImage(event, trade: AdminServiceType, overlaypanel: OverlayPanel): void {
    this.selectedService = trade;
    overlaypanel.toggle(event);
  }

  deleteService(service: AdminServiceType): void {
    this.confirmationService.confirm({
      header: 'Delete Service?',
      icon: 'pi pi-question-circle',
      message: `Do you want to delete ${service.name}`,
      accept: () => {
        this.serviceTypeService.deleteServiceTypeById(service.id).subscribe(res => {
            this.services.content = this.services.content.filter(item => item.id != service.id);
            this.popUpService.showSuccess(`${service.name} has been deleted`);
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
          }
        );
      }
    });
  }

  clearRatingFilter(col, dt: DataTable): void {
    if (this.ratingTimeout) {
      clearTimeout(this.ratingTimeout);
    }
    this.filters[col.field + 'From'] = {value: this.minRatingValue};
    this.filters[col.field + 'To'] = {value: this.maxRatingValue};
    this.ratingFilter = [this.minRatingValue, this.maxRatingValue];
    this.ratingTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

  onRatingFilterChange(event, dt: DataTable, col) {
    if (this.ratingTimeout) {
      clearTimeout(this.ratingTimeout);
    }
    this.filters[col.field + 'From'] = {value: event.values[0]};
    this.filters[col.field + 'To'] = {value: event.values[1]};
    this.ratingTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

  clearPriceFilter(col, dt: DataTable): void {
    if (this.priceTimeout) {
      clearTimeout(this.priceTimeout);
    }
    this.filters[col.field + 'From'] = {value: (this.minPriceValue * 100).toString()};
    this.filters[col.field + 'To'] = {value: (this.maxPriceValue * 100).toString()};
    this.priceFilter = [this.minPriceValue, this.maxPriceValue];
    this.priceTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

  onPriceFilterChange(event, dt: DataTable, col) {
    if (this.priceTimeout) {
      clearTimeout(this.priceTimeout);
    }
    this.filters[col.field + 'From'] = {value: (parseInt(event.values[0]) * 100).toString()};
    this.filters[col.field + 'To'] = {value: (parseInt(event.values[1]) * 100).toString()};
    this.priceTimeout = setTimeout(() => {
      dt.filter(null, col.field, col.filterMatchMode);
    }, 350);
  }

}
