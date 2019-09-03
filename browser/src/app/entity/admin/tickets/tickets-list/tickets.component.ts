import { Component, ViewChild } from '@angular/core';
import { Pagination } from '../../../../model/data-model';
import { MenuItem, SelectItem } from 'primeng/primeng';
import { enumToArrayList, filtersToParams } from '../../../../util/tricks.service';
import { RestPage } from '../../../../api/models/RestPage';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Ticket } from "../../../../api/models/Ticket";
import { TicketService } from "../../../../api/services/ticket.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { getErrorMessage, getKeyFromEnum } from "../../../../util/functions";
import { Priority } from "../../../../api/models/Priority";
import { UserService } from "../../../../api/services/user.service";
import { Role } from "../../../../model/security-model";
import { SecurityService } from "../../../../auth/security.service";


@Component({
  selector: 'tickets',
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsListComponent {
  @ViewChild('dt') dataTable: any;
  displayTicketDialog = false;
  processing = true;
  tickets: RestPage<Ticket> = new RestPage<Ticket>();
  rowsPerPage: Array<number> = [10, 50, 100];
  tableColumns: Array<SelectItem> = [];
  ticketSubjectFilter: Array<SelectItem> = [];
  ticketStatusFilter: Array<SelectItem> = [];
  ticketPriorityFilter: Array<SelectItem> = [];
  selected: Ticket;
  selectedTableCols: Array<string> = [
    'id',
    'created',
    'email',
    'name',
    'businessName',
    'option',
    'status',
    'priority',
    'assignee',
    'author'
  ];
  contextMenuItems: Array<MenuItem> = [];
  filters: any;

  constructor(private ticketService: TicketService,
              private userService: UserService,
              private securityService: SecurityService,
              private router: Router,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService) {
    this.ticketSubjectFilter = enumToArrayList(Ticket.Subject).map(item => {
      return {label: item, value: item};
    });
    this.ticketSubjectFilter.unshift({label: 'All', value: ''});
    this.ticketStatusFilter = enumToArrayList(Ticket.Status).map(item => {
      return {label: item, value: item};
    });
    this.ticketStatusFilter.unshift({label: 'All', value: ''});
    this.ticketPriorityFilter = enumToArrayList(Priority).map(item => {
      return {label: item, value: item};
    });
    this.ticketPriorityFilter.unshift({label: 'All', value: ''});
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
          || this.securityService.hasRole(Role.ADMIN) && this.selected.status != Ticket.Status.CLOSED,
      styleClass: 'danger-menu-button'
      }
    ]
  }

  isEditable() {
    return  this.selected.status != Ticket.Status.CLOSED
      && ((!this.selected.assigneeId || this.selected.assigneeId == this.securityService.getLoginModel().id) || this.securityService.hasRole(Role.ADMIN));
  }

  canStart() {
    return  this.selected.status == Ticket.Status.NEW
      && ((!this.selected.assigneeName || this.selected.assigneeName === this.securityService.getLoginModel().name));
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
    this.initContextMenu();
  }

  expandRow(selection: { originalEvent: MouseEvent, data: Ticket }): void {
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
    if (filters['option']) {
      filters['option'] = getKeyFromEnum(Ticket.Subject, filters['option']);
    }
    this.processing = true;
    this.ticketService.getAll(filters, pagination).subscribe(
      (restPage: RestPage<Ticket>) => {
        this.processing = false;
        this.tickets = restPage;
        if (restPage.content.length > 0) {
          this.tableColumns = [...this.selectedTableCols, ...Object.keys(restPage.content[0])]
            .filter((elem, pos, arr) => arr.indexOf(elem) == pos) //remove duplicates
            .filter(e => !(e == 'assigneeId' || e == 'assigneeName' || e == 'assigneeEmail' || e == 'authorRole'  || e == 'authorEmail'))
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
        this.popUpService.showSuccess('Ticket has been closed');
        this.refresh();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
  }

}
