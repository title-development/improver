import { Component, OnInit, ViewChild } from '@angular/core';
import { Pagination, Review } from '../../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { RestPage } from '../../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Ticket } from "../../../../api/models/Ticket";
import { TicketService } from "../../../../api/services/ticket.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage, getKeyFromEnum } from "../../../../util/functions";
import { Refund } from "../../../../api/models/Refund";
import { Priority } from "../../../../api/models/Priority";
import { SecurityService } from "../../../../auth/security.service";
import { Role } from "../../../../model/security-model";


@Component({
  selector: 'tickets-inreview',
  templateUrl: './inreview.component.html',
  styleUrls: ['./inreview.component.scss']
})
export class TicketsInreviewComponent {
  @ViewChild('dt') table: any;
  displayTicketDialog = false;
  processing = true;
  tickets: RestPage<Ticket> = new RestPage<Ticket>();
  rowsPerPage: Array<number> = [10, 50, 100];
  ticketOptionFilter: Array<SelectItem> = [];
  ticketStatusFilter: Array<SelectItem> = [];
  ticketPriorityFilter: Array<SelectItem> = [];
  selected: Ticket;

  columns = [
    {field: 'id', header: 'Id', active: true},
    {field: 'created', header: 'Created', active: true},
    {field: 'email', header: 'Email', active: true},
    {field: 'name', header: 'Name', active: true},
    {field: 'businessName', header: 'Business Name', active: true},
    {field: 'option', header: 'Option', active: true},
    {field: 'status', header: 'Status', active: true},
    {field: 'priority', header: 'Priority', active: true},
    {field: 'author', header: 'Author', active: true}
  ];

  selectedColumns = this.columns.filter(column => column.active);

  contextMenuItems: Array<MenuItem> = [];

  filters: any;

  constructor(private ticketService: TicketService,
              private router: Router,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService,
              public securityService: SecurityService) {
    this.ticketOptionFilter = enumToArrayList(Ticket.Subject).map(item => {
      return {label: item, value: item};
    });
    this.ticketOptionFilter.unshift({label: 'All', value: ''});
    this.ticketStatusFilter = enumToArrayList(Ticket.Status).map(item => {
      return {label: item, value: item};
    });
    this.ticketStatusFilter.unshift({label: 'All', value: ''});
    this.ticketPriorityFilter = enumToArrayList(Priority).map(item => {
      return {label: item, value: item};
    });
    this.ticketPriorityFilter.unshift({label: 'All', value: ''});
  }

  onColumnSelect(event) {
    let changedColumn = this.columns.find(column => column.field == event.itemValue.field);
    changedColumn.active = !changedColumn.active;
    this.selectedColumns = this.columns.filter(column => column.active);
  }

  loadDataLazy(filters = {}, pagination: Pagination = new Pagination()) {
    this.getTickets(filters, pagination)
  }

  onLazyLoad(event: any) {
    this.loadDataLazy(filtersToParams(event.filters), new Pagination().fromPrimeNg(event));
  }

  refresh(): void {
    this.table.onLazyLoad.emit(this.table.createLazyLoadMetadata());
  }

  initContextMenu() {
    this.contextMenuItems = [
      {
        label: 'View/Edit',
        icon: 'fa fa-edit',
        command: () => { this.displayTicketDialog = true }
      },
      {
        label: 'Start progress',
        icon: 'fa fa-play-circle',
        command: () => this.start(this.selected),
        visible: this.canStart()
      },
      {
        label: 'Close',
        icon: 'fa fa-minus-circle',
        command: () => this.close(this.selected),
        visible: this.isEditable() && this.selected.status == Ticket.Status.IN_PROGRESS
          || this.securityService.hasRole(Role.ADMIN) && this.selected.status != Ticket.Status.CLOSED
      }
    ]
  }

  isEditable() {
    return  this.selected.status != Ticket.Status.CLOSED
      && ((!this.selected.assigneeId || this.selected.assigneeId == this.securityService.getLoginModel().id) || this.securityService.hasRole(Role.ADMIN));
  }

  canStart() {
    return  this.selected.status == Ticket.Status.NEW
      && (!this.selected.assigneeName || this.selected.assigneeName === this.securityService.getLoginModel().name);
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Review }): void {
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

  getTickets(filters = {}, pagination: Pagination = new Pagination(0, this.rowsPerPage[0])): void {
    this.processing = true;
    filters['unassignedOnly'] = true;
    filters['status'] = Ticket.Status.NEW.toString();
    if (filters['option']) {
      filters['option'] = getKeyFromEnum(Ticket.Subject, filters['option']);
    }
    this.ticketService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<Ticket>) => {
        this.processing = false;
        this.tickets = restPage;
      }, err => {
        this.processing = false;
      });
  }

  start(ticket) {
    this.ticketService.changeStatus(ticket.id, Ticket.Status.IN_PROGRESS).subscribe(
      responce => {
        this.popUpService.showSuccess('Work on Ticket has been started');
        this.refresh();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
  }

  close(ticket) {
    this.ticketService.changeStatus(ticket.id, Ticket.Status.CLOSED).subscribe(
      responce => {
        this.popUpService.showSuccess('Done');
        this.refresh();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
  }

}
