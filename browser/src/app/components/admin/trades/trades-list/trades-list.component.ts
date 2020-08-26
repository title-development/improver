import { Component, ViewChild } from '@angular/core';
import { TradeService } from '../../../../api/services/trade.service';
import { ConfirmationService, FilterMetadata, MenuItem, OverlayPanel, Table } from 'primeng';
import { Router } from '@angular/router';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { ErrorHandler } from '../../../../util/handlers/error-handler';
import { AdminTrade } from '../../../../api/models/AdminTrade';
import { filtersToParams } from '../../../../api/services/tricks.service';
import { first } from 'rxjs/operators';
import { PopUpMessageService } from "../../../../api/services/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";
import { Role } from "../../../../model/security-model";
import { SecurityService } from "../../../../auth/security.service";

@Component({
  selector: 'trades-list',
  templateUrl: './trades-list.component.html',
  styleUrls: ['./trades-list.component.scss']
})
export class TradesListComponent {
  @ViewChild('dt') table: any;
  selectedTrade: AdminTrade;
  fetching: boolean = true;
  maxRatingValue: number = 5;
  minRatingValue: number = 0;
  ratingFilter: Array<number> = [this.minRatingValue, this.maxRatingValue];
  ratingTimeout;
  filters: { [s: string]: FilterMetadata } = {};
  rowsPerPage: Array<number> = [10, 50, 100];
  trades: RestPage<AdminTrade> = new RestPage<AdminTrade>();
  Role = Role;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'imageUrls', header: 'Image', active: true},
    {field: 'name', header: 'Name', active: true},
    {field: 'description', header: 'Description', active: true},
    {field: 'isAdvertised', header: 'Advertised', active: true},
    {field: 'rating', header: 'Rating', active: true},
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [
    {
      label: 'View',
      icon: 'fa fa-eye',
      command: () => this.router.navigate(['admin', 'trades', 'view', this.selectedTrade.id]),
      visible: this.securityService.hasRole(Role.SUPPORT)
    },
    {
      label: 'Edit',
      icon: 'fa fa-pencil',
      command: () => this.router.navigate(['admin', 'trades', 'edit', this.selectedTrade.id]),
      visible: this.securityService.hasRole(Role.ADMIN)
    },
    {
      label: 'Delete',
      icon: 'fa fa-trash',
      command: () => this.deleteTrade(this.selectedTrade),
      visible: this.securityService.hasRole(Role.ADMIN),
      styleClass: 'danger-menu-button'
    }
  ];

  constructor(private tradeService: TradeService,
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
    this.getTrades(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  getTrades(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.tradeService.getAll(filters, pagination)
      .pipe(first())
      .subscribe((trades: RestPage<AdminTrade>) => {
          this.fetching = false;
          this.trades = trades;
        },
        err => this.fetching = false);
  }

  showTradeImage(event, trade: AdminTrade, overlayPanel: OverlayPanel): void {
    this.selectedTrade = trade;
    overlayPanel.toggle(event);
  }

  deleteTrade(trade: AdminTrade): void {
    this.confirmationService.confirm({
      icon: 'pi pi-question-circle',
      header: 'Delete Trade?',
      message: `Do you want to delete ${trade.name}`,
      accept: () => {
        this.tradeService.deleteTradeById(trade.id).subscribe(res => {
            this.trades.content = this.trades.content.filter(item => item.id != trade.id);
            this.popUpService.showSuccess(`Trade ${trade.name} has been deleted`);
          },
          err => {
            this.popUpService.showError(getErrorMessage(err));
          }
        );
      }
    });
  }

  expandRow(selection: { originalEvent: MouseEvent, data: AdminTrade }): void {
    if (!this.table.expandedRows) {
      this.table.expandedRows = [];
    }
    if (this.table.expandedRows.some(item => item.id == selection.data.id)) {
      this.table.expandedRows = this.table.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.table.expandedRows = [];
      this.table.expandedRows.push(selection.data);
    }
  }

}
