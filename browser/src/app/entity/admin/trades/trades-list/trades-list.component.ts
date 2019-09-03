import { Component, ViewChild } from '@angular/core';
import { TradeService } from '../../../../api/services/trade.service';
import { ConfirmationService, DataTable, FilterMetadata, MenuItem, OverlayPanel } from 'primeng/primeng';
import { Router } from '@angular/router';
import { Pagination } from '../../../../model/data-model';
import { RestPage } from '../../../../api/models/RestPage';
import { ErrorHandler } from '../../../../util/error-handler';
import { AdminTrade } from '../../../../api/models/AdminTrade';
import { filtersToParams } from '../../../../util/tricks.service';
import { first } from 'rxjs/operators';
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage } from "../../../../util/functions";
import { Role } from "../../../../model/security-model";
import { SecurityService } from "../../../../auth/security.service";

@Component({
  selector: 'trades-list',
  templateUrl: './trades-list.component.html',
  styleUrls: ['./trades-list.component.scss']
})
export class TradesListComponent {
  @ViewChild('dt') dataTable: any;
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

  refresh(): void {
    const paging = {
      first: this.dataTable.first,
      rows: this.dataTable.rows
    };
    this.dataTable.expandedRows = [];
    this.dataTable.paginate(paging);
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

  loadTradesLazy(event): void {
    this.getTrades(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectTrade(selection: { originalEvent: MouseEvent, data: AdminTrade }): void {
    this.selectedTrade = selection.data;
  }

  showTradeImage(event, trade: AdminTrade, overlaypanel: OverlayPanel): void {
    this.selectedTrade = trade;
    overlaypanel.toggle(event);
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
    if (!this.dataTable.expandedRows) {
      this.dataTable.expandedRows = [];
    }
    if (this.dataTable.expandedRows.some(item => item.id == selection.data.id)) {
      this.dataTable.expandedRows = this.dataTable.expandedRows.filter(item => item.id != selection.data.id);
    } else {
      this.dataTable.expandedRows = [];
      this.dataTable.expandedRows.push(selection.data);
    }
  }

  clearRatingFilter(col, dt: DataTable): void {
    if (this.ratingTimeout) {
      clearTimeout(this.ratingTimeout);
    }
    this.filters[col.field + 'From'] = {value: this.minRatingValue.toString()};
    this.filters[col.field + 'To'] = {value: this.maxRatingValue.toString()};
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

}
