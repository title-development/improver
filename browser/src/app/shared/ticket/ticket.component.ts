import { Component, OnInit } from '@angular/core';
import { Messages } from "../../util/messages";
import { Constants } from "../../util/constants";
import { Ticket } from "../../api/models/Ticket";
import { Role } from "../../model/security-model";
import { SecurityService } from "../../auth/security.service";
import { AccountService } from "../../api/services/account.service";
import { NgForm } from "@angular/forms";
import { TicketService } from "../../api/services/ticket.service";
import { PopUpMessageService } from "../../util/pop-up-message.service";
import { getErrorMessage, getKeyFromEnum } from "../../util/functions";

@Component({
  selector: 'ticket-page',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {

  Role = Role;

  options: Ticket.Option [] = [];

  ticket: Ticket = {
    name: '',
    email: '',
    businessName: '',
    description: '',
    option: null
  };

  ticketSent = false;
  ticketProcessing = false;

  constructor(public constants: Constants,
              public messages: Messages,
              public securityService: SecurityService,
              public accountService: AccountService,
              public ticketsService: TicketService,
              public popUpService: PopUpMessageService) {

    this.initForm();
    this.securityService.onUserInit.subscribe(this.initForm);

  }

  onSubmit(form: NgForm) {
    this.ticketProcessing = true;
    let ticket = { ...this.ticket };
    ticket.option = getKeyFromEnum(Ticket.Option, this.ticket.option);
    this.ticketsService.post(ticket).subscribe(
      response => {
        this.ticketSent = true;
        this.ticketProcessing = false;
      },
      err => {
        this.ticketProcessing = false;
        this.popUpService.showError(getErrorMessage(err));
      }
    );
  }

  initForm = () => {
    this.options = Ticket.getTicketOptions(this.securityService.getRole());
    if (this.securityService.isAuthenticated()) {

      this.accountService
        .getAccount(this.securityService.getLoginModel().id)
        .subscribe(
          account => {
            this.ticket.email = account.email;
            this.ticket.name = `${account.firstName} ${account.lastName}`;
          },
          err => {
            console.log(err);
          }
        );

      if (this.securityService.hasRole(Role.CONTRACTOR)) {
        this.ticket.businessName = this.securityService.getLoginModel().name;
      }

    }
  }


}
