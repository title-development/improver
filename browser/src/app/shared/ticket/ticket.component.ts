import { Component } from '@angular/core';
import { TextMessages } from "../../util/text-messages";
import { Constants } from "../../util/constants";
import { Ticket } from "../../api/models/Ticket";
import { Role } from "../../model/security-model";
import { SecurityService } from "../../auth/security.service";
import { AccountService } from "../../api/services/account.service";
import { NgForm } from "@angular/forms";
import { TicketService } from "../../api/services/ticket.service";
import { PopUpMessageService } from "../../api/services/pop-up-message.service";
import { getErrorMessage, getKeyFromEnum } from "../../util/functions";

@Component({
  selector: 'ticket-page',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {

  Role = Role;

  options: Ticket.Subject [] = [];

  ticket: Ticket = {
    name: '',
    email: '',
    businessName: '',
    description: '',
    subject: null
  };

  ticketSent = false;
  ticketProcessing = false;

  constructor(public constants: Constants,
              public messages: TextMessages,
              public securityService: SecurityService,
              public accountService: AccountService,
              public ticketsService: TicketService,
              public popUpService: PopUpMessageService) {

    this.initForm();
    this.securityService.isUserLoggedIn.subscribe(isUserInSystem => {
      if (isUserInSystem) {
        this.initForm();
      }
    })

  }

  onSubmit(form: NgForm) {
    this.ticketProcessing = true;
    let ticket = { ...this.ticket };
    ticket.subject = getKeyFromEnum(Ticket.Subject, this.ticket.subject);
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
    this.options = Ticket.getTicketSubjects(this.securityService.getRole());
    if (this.securityService.isAuthenticated()) {

      this.accountService
        .getAccount(this.securityService.getLoginModel().id)
        .subscribe(
          account => {
            this.ticket.email = account.email;
            this.ticket.name = `${account.firstName} ${account.lastName}`;
          },
          err => {
            console.error(err);
          }
        );

      if (this.securityService.hasRole(Role.CONTRACTOR)) {
        this.ticket.businessName = this.securityService.getLoginModel().name;
      }

    }
  }


}
