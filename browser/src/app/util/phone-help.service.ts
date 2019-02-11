import { Injectable, Inject } from "@angular/core";
import { Ticket } from "../api/models/Ticket";
import { TicketService } from "../api/services/ticket.service";
import { getKeyFromEnum } from "./functions";

export enum PhoneHelpState {
  VISIBLE  = 'VISIBLE',
  PARTIAL  = 'PARTIAL',
  HIDDEN  = 'HIDDEN'
}

@Injectable()
export class PhoneHelpService {

  public state: PhoneHelpState = PhoneHelpState.HIDDEN;

  constructor(private ticketService: TicketService) {
  }

  hide(event?: Event) {
    this.state = PhoneHelpState.HIDDEN;
    event ? event.stopPropagation() : '';
  }

  showFull(event?: Event) {
    this.state = PhoneHelpState.VISIBLE;
    event ? event.stopPropagation() : '';
  }

  showPartial(event?: Event) {
    this.state = PhoneHelpState.PARTIAL;
    event ? event.stopPropagation() : '';
  }

  requestCall(name, phone) {
    let ticket: Ticket = {
      name: name,
      description: `User requested phone help for ${phone}`,
      subject: getKeyFromEnum(Ticket.Subject, Ticket.Subject.PHONE_HELP_REQUEST),
      businessName: "",
      email: ""
    };
    return this.ticketService.post(ticket);
  }

}



