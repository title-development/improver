import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pagination } from '../../../../model/data-model';
import { CamelCaseHumanPipe } from '../../../../pipes/camelcase-to-human.pipe';
import { Router } from '@angular/router';
import { Ticket } from "../../../../api/models/Ticket";
import { TicketService } from "../../../../api/services/ticket.service";
import { PopUpMessageService } from "../../../../util/pop-up-message.service";
import { enumToJson, getErrorMessage } from "../../../../util/functions";
import { Priority } from "../../../../api/models/Priority";
import { UserService } from "../../../../api/services/user.service";
import { SecurityService } from "../../../../auth/security.service";
import { Role } from "../../../../model/security-model";

@Component({
  selector: 'ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html'
})
export class TicketEditDialogComponent {

  Ticket = Ticket;

  selected: Ticket;
  baseStatus: Ticket.Status;
  baseAssignee: string;

  @Input()
  set ticket(val: Ticket) {
    this.selected = Object.assign({}, val);
    this.baseStatus = this.selected.status;
    this.baseAssignee = this.selected.assignee;
  }

  private displayValue = false;
  get displayDialog(){
    return this.displayValue;
  }
  set displayDialog(val) {
    this.displayValue = val;
    this.displayChange.emit(this.displayValue);
  }
  @Input()
  get display(){
    return this.displayValue;
  }
  set display(val) {
    this.displayValue = val;
    this.displayChange.emit(this.displayValue);
  }
  @Output() displayChange = new EventEmitter<boolean>();

  @Output()
  onUpdate = new EventEmitter<any>();

  statuses = enumToJson(Ticket.Status);
  priorities = enumToJson(Priority);
  supports = [];

  processing = true;

  constructor(private ticketService: TicketService,
              private userService: UserService,
              private securityService: SecurityService,
              private router: Router,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService) {


    this.getSupports();
  }

  isEditable() {
    let name;
    if (this.baseAssignee) {
      name = this.baseAssignee;
      name = name.substring(name.indexOf("<") + 1, name.indexOf(">"));
    }
    return this.securityService.hasRole(Role.ADMIN) || (this.baseStatus != Ticket.Status.CLOSED && (!name || name === this.securityService.getLoginModel().name));
  }

  updateTicket(ticket) {
    this.ticketService.update(ticket).subscribe(
      responce => {
        this.popUpService.showSuccess('Ticket has been updated');
        this.display = false;
        this.onUpdate.emit();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
  }

  getSupports() {
    this.userService.getAll({role: "SUPPORT"}, new Pagination(0, 100, "displayName,asc")).subscribe(
      supports => {
        this.supports = supports.content.map(item => {
          return {
            label: `${item.email} <${item.displayName}>`,
            value: `${item.email} <${item.displayName}>`
          }
        });
        this.supports.unshift({
          label: "None",
          value: null
        });
        this.processing = false;
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }

}
