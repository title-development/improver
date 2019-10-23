import { Role } from "../../model/security-model";
import { Priority } from "./Priority";

export class Ticket {
  id?: string;
  name?: string;
  email?: string;
  businessName?: string;
  subject?: Ticket.Subject | any;
  status?: Ticket.Status | any;
  priority?: Priority | any = Priority.MEDIUM;
  description?: string;
  replyMessage?: string;
  isReplied?: boolean;
  created?: string;
  assigneeId?: string;
  assigneeEmail?: string;
  assigneeName?: string;
  authorEmail?: string;
  authorRole?: string;

  constructor() {}

}

export namespace Ticket {

  export function getTicketSubjects(role: Role): Ticket.Subject[] {
    let subjects: Ticket.Subject[] = [];
    switch (role) {
      case Role.CUSTOMER: {
        subjects = [Ticket.Subject.FEEDBACK, Ticket.Subject.REMOVE_ACCOUNT, Ticket.Subject.PHONE_HELP_REQUEST, Ticket.Subject.OTHER];
        break;
      }
      case Role.CONTRACTOR: {
        subjects = [Ticket.Subject.REQUESTING_CREDIT, Ticket.Subject.PROVIDED_SERVICES, Ticket.Subject.COVERAGE_AREA,
          Ticket.Subject.COMPANY_PROFILE, Ticket.Subject.BILLING, Ticket.Subject.PHONE_HELP_REQUEST, Ticket.Subject.OTHER];
        break;
      }
      default: {
        subjects = [Ticket.Subject.FEEDBACK, Ticket.Subject.LOGIN_ISSUE, Ticket.Subject.REMOVE_ACCOUNT, Ticket.Subject.PHONE_HELP_REQUEST, Ticket.Subject.OTHER];
        break;
      }
    }
    return subjects
  }

  export enum Subject {
    ACCOUNT_ISSUE = "Account issue",
    LOGIN_ISSUE = "Can't login",
    REMOVE_ACCOUNT = "Remove account",
    PHONE_HELP_REQUEST = "Phone help request",
    REQUESTING_CREDIT = "Request a credit",
    PROVIDED_SERVICES = "Adjusting services",
    COVERAGE_AREA = "Service area",
    BILLING = "Billing and Subscription",
    COMPANY_PROFILE = "Company profile",
    FEEDBACK = "Leave feedback",
    OTHER = "Other"
  }

  export namespace Subject {
  }

  export enum Status {
    NEW = "NEW",
    IN_PROGRESS = "IN_PROGRESS",
    CLOSED = "CLOSED"
  }

}


