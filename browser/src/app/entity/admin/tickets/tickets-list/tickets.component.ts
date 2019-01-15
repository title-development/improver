import { Component, OnInit, ViewChild } from '@angular/core';
import { Pagination, Review } from '../../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { RestPage } from '../../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Ticket } from "../../../../api/models/Ticket";
import { TicketService } from "../../../../api/services/ticket.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage, getKeyFromEnum } from "../../../../util/functions";
import { Project } from "../../../../api/models/Project";


@Component({
  selector: 'tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsListComponent {
  @ViewChild('dt') dataTable: any;
  processing = true;
  tickets: RestPage<Ticket> = new RestPage<Ticket>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
  ticketOptionFilter: Array<SelectItem> = [];
  ticketStatusFilter: Array<SelectItem> = [];
  selected: Ticket;
  selectedTableCols: Array<string> = [
    'id',
    'created',
    'email',
    'name',
    'businessName',
    'option',
    'status'
  ];
  defaultContextMenuItems: Array<MenuItem> = [
    {
      label: 'View',
      icon: 'fa fa-eye',
      command: () => this.expandRow({originalEvent: null, data: this.selected })
    },
    {
      label: 'Start progress',
      icon: 'fa fa-play-circle',
      command: () => this.start(this.selected)
    },
    {
      label: 'Close',
      icon: 'fa fa-minus-circle',
      command: () => this.close(this.selected)
    }
  ];
  contextMenuItems: Array<MenuItem> = [];
  filters: any;

  constructor(private ticketService: TicketService,
              private router: Router,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService) {
    this.ticketOptionFilter = enumToArrayList(Ticket.Option).map(item => {
      return {label: item, value: item};
    });
    this.ticketOptionFilter.unshift({label: 'All', value: ''});
    this.ticketStatusFilter = enumToArrayList(Ticket.Status).map(item => {
      return {label: item, value: item};
    });
    this.ticketStatusFilter.unshift({label: 'All', value: ''});
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
    this.getTickets(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  selectItem(selection: { originalEvent: MouseEvent, data: Ticket }): void {
    this.selected = selection.data;
    this.contextMenuItems = this.defaultContextMenuItems.filter(item => {
      let pass = true;
      if (this.selected.status == Ticket.Status.IN_PROGRESS) {
        pass = item.label != 'Start progress';
      } else if (this.selected.status == Ticket.Status.CLOSED) {
        pass = (item.label != 'Start progress') &&
          (item.label != 'Close')
      }
      return pass;
    });
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Review }): void {
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

  getTickets(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    console.log(filters);
    if (filters['option']) {
      filters['option'] = getKeyFromEnum(Ticket.Option, filters['option']);
    }
    this.processing = true;
    this.ticketService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<Ticket>) => {
        this.processing = false;
        this.tickets = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter((elem) => !(elem == 'updated' || elem == 'description'))
            .map(key => {
                return {label: this.camelCaseHumanPipe.transform(key, true), value: key};
              }
            );
        }
      }, err => {
        this.processing = false;
      });
  }

  start(ticket) {
    this.ticketService.changeStatus(ticket.id, Ticket.Status.IN_PROGRESS).subscribe(
      responce => {
        this.popUpService.showSuccess('Ticket has been moved to review');
        this.refresh();
      },
    err => {
      this.popUpService.showError(getErrorMessage(err))
    });
  }

  close(ticket) {
    this.ticketService.changeStatus(ticket.id, Ticket.Status.CLOSED).subscribe(
      responce => {
        this.popUpService.showSuccess('Ticket has been closed');
        this.refresh();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
  }

}
