import { Component, ViewChild } from '@angular/core';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { ConfirmationService, Table, FilterMetadata, MenuItem, OverlayPanel } from 'primeng';
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
  @ViewChild('dt') table: any;
  selectedService: AdminServiceType;
  fetching: boolean = true;
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

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'imageUrl', header: 'Image', active: true},
    {field: 'name', header: 'Name', active: true},
    {field: 'description', header: 'Description', active: false},
    {field: 'leadPrice', header: 'Lead Price', active: true},
    {field: 'rating', header: 'Rating', active: true},
    {field: 'labels', header: 'Labels', active: false},
    {field: 'trades', header: 'Trades', active: true},
    {field: 'questionaryId', header: 'Questionary', active: true},
    {field: 'active', header: 'Active', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

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
      visible: this.securityService.hasRole(Role.ADMIN),
      styleClass: 'danger-menu-button'
    }
  ];

  constructor(private serviceTypeService: ServiceTypeService,
              private popUpService: PopUpMessageService,
              private confirmationService: ConfirmationService,
              private router: Router,
              public securityService: SecurityService,
              private errorHandler: ErrorHandler) {
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getServices(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getServices(filters: any = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.serviceTypeService.getAll(filters, pagination).subscribe((services: RestPage<AdminServiceType>) => {
        this.fetching = false;
        this.services = services;
      },
      err => this.fetching = false
    );
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

}
