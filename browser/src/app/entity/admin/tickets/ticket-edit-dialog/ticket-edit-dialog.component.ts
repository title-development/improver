import {
  ApplicationRef, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
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
import { NgForm } from "@angular/forms";

@Component({
  selector: 'ticket-edit-dialog',
  templateUrl: './ticket-edit-dialog.component.html'
})
export class TicketEditDialogComponent implements OnChanges {
  @ViewChild('form') form: NgForm;

  mode: 'new' | 'edit' = 'edit';

  Ticket = Ticket;

  selected: Ticket;
  baseStatus: Ticket.Status;
  baseAssigneeName: string;

  @Input()
  set ticket(val: Ticket) {
    this.selected = Object.assign({}, val);
    this.baseStatus = this.selected.status;
    this.baseAssigneeName = this.selected.assigneeName;
    if (this.selected.assigneeEmail)
      this.selected.assigneeEmail = `${this.selected.assigneeEmail} <${this.selected.assigneeName}>`;
    if (this.selected.authorEmail)
      this.selected.authorEmail = `${this.selected.authorEmail} <${this.selected.authorRole}>`;
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
  onDone = new EventEmitter<any>();

  statuses = enumToJson(Ticket.Status);
  priorities = enumToJson(Priority);
  options = enumToJson(Ticket.Subject);

  staff = [];

  processing = true;



  constructor(private ticketService: TicketService,
              private userService: UserService,
              private securityService: SecurityService,
              private router: Router,
              public camelCaseHumanPipe: CamelCaseHumanPipe,
              public popUpService: PopUpMessageService) {
    this.getSupports();

    this.options.unshift({
      label: "None",
      value: null
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ticket) {
      if (!changes.ticket.currentValue) {
        this.selected = new Ticket();
        this.mode = 'new'
      } else {
        this.mode = 'edit'
      }
    }
  }

  reset() {
    this.selected = new Ticket();
    this.baseStatus = undefined;
    this.baseAssigneeName = undefined;
  }

  isEditable() {
    return this.securityService.hasRole(Role.ADMIN) || (this.baseStatus != Ticket.Status.CLOSED && (!this.baseAssigneeName || this.baseAssigneeName === this.securityService.getLoginModel().name));
  }

  updateTicket(ticket) {
    this.ticketService.update(this.prepareTicketForSave(ticket)).subscribe(
      response => {
        this.popUpService.showSuccess('Ticket has been updated');
        this.display = false;
        this.form.resetForm(this.selected);
        this.onDone.emit();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
    return true;
  }

  createTicket(ticket) {
    this.ticketService.createByStaff(this.prepareTicketForSave(ticket)).subscribe(
      response => {
        this.popUpService.showSuccess('Ticket has been created');
        this.display = false;
        this.form.resetForm(new Ticket());
        this.onDone.emit();
      },
      err => {
        this.popUpService.showError(getErrorMessage(err))
      });
    return true;
  }

  getSupports() {
    this.userService.getStaff(new Pagination(0, 100, "displayName,asc")).subscribe(
      supports => {
        this.staff = supports.content.map(item => {
          return {
            label: `${item.email} <${item.displayName}>`,
            value: `${item.email} <${item.displayName}>`
          }
        });
        this.staff.unshift({
          label: "None",
          value: null
        });
        this.processing = false;
      },
      err => this.popUpService.showError(getErrorMessage(err)))
  }

  prepareTicketForSave(ticket) {
    let prepared = Object.assign({}, ticket);
    if(prepared.assigneeEmail) {
      let assigneeEmail = prepared.assigneeEmail;
      prepared.assigneeEmail = assigneeEmail.replace(/\s{1}<{1}[a-zA-Z,\s]+>/, "");
    }
    return prepared;
  }

}
