import { Role } from "../../model/security-model";
import { Priority } from "./Priority";

export class Ticket {
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  option?: Ticket.Option | any;
  status?: Ticket.Status | any;
  priority?: Priority | any;
  description?: string;
  replyMessage?: string;
  isReplied?: boolean;
  created?: string;
  assignee?: string;

  constructor() {}

}

export namespace Ticket {

  export function getTicketOptions(role: Role): Ticket.Option[] {
    let options: Ticket.Option[] = [];
    switch (role) {
      case Role.CUSTOMER: {
        options = [Ticket.Option.FEEDBACK, Ticket.Option.REMOVE_ACCOUNT, Ticket.Option.PHONE_HELP_REQUEST, Ticket.Option.OTHER];
        break;
      }
      case Role.CONTRACTOR: {
        options = [Ticket.Option.REQUESTING_CREDIT, Ticket.Option.PROVIDED_SERVICES, Ticket.Option.COVERAGE_AREA,
          Ticket.Option.COMPANY_PROFILE, Ticket.Option.BILLING, Ticket.Option.PHONE_HELP_REQUEST, Ticket.Option.OTHER];
        break;
      }
      default: {
        options = [Ticket.Option.FEEDBACK, Ticket.Option.LOGIN_ISSUE, Ticket.Option.REMOVE_ACCOUNT, Ticket.Option.PHONE_HELP_REQUEST, Ticket.Option.OTHER];
        break;
      }
    }
    return options
  }

  export enum Option {
    LOGIN_ISSUE = "Can't login",
    FEEDBACK = "Leave feedback",
    REMOVE_ACCOUNT = "Remove account",
    REQUESTING_CREDIT = "Request a credit",
    PROVIDED_SERVICES = "Adjusting services",
    COVERAGE_AREA = "Coverage configuration",
    BILLING = "Billing and Subscription",
    COMPANY_PROFILE = "Company profile",
    PHONE_HELP_REQUEST = "Phone help request",
    OTHER = "Other"
  }

  export enum Status {
    NEW = "NEW",
    IN_PROGRESS = "IN_PROGRESS",
    CLOSED = "CLOSED"
  }

}


