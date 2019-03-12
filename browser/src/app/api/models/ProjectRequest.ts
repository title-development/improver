import { CompanyInfo, UserInfo } from '../../model/data-model';
import { Project } from './Project';

export class ProjectRequest {
  id: string;
  status: ProjectRequest.Status;
  projectStatus: Project.Status;
  reviewed: boolean;
  company: CompanyInfo;
  contractor: UserInfo;
  unreadMessages: number;
}

export namespace ProjectRequest {
  export enum Reason {
    DONE = 'DONE',
    TOO_EXPENSIVE = 'They are too expensive',
    NOT_RELIABLE = 'They are not reliable',
    NOT_QUALIFIED = 'They are not qualified to do the project',
    COULD_NOT_SCHEDULE = 'We couldn\'t schedule',
    DID_NOT_SHOW_UP = 'They didn\'t show up for appointment',
    RUDE = 'They where rude or inappropriate',
    HIRE_OTHER = 'I hired someone else',
    OTHER = 'Other, please specify'
  }

  export enum Status {
    // ACTIVE TAB
    ACTIVE = 'ACTIVE',
    HIRED = 'HIRED',
    DECLINED = 'DECLINED',
    INACTIVE = 'INACTIVE',
    REFUND = 'REFUND',
    // PREVIOUS TAB
    COMPLETED = 'COMPLETED',
    REFUNDED = 'REFUNDED',
    CLOSED = 'CLOSED'
  }

  export enum MessageEvent {
    CALL = 'CALL',
    READ = 'READ',
    IS_TYPING = 'IS_TYPING',
    REQUEST = 'REQUEST',
    AUTO_CLOSE = "AUTO_CLOSE",
    //Customer
    HIRE = 'HIRE',
    DECLINE = 'DECLINE',
    CUSTOMER_CLOSE = "CUSTOMER_CLOSE",
    CANCEL = 'CANCEL',
    HIRE_OTHER = "HIRE_OTHER",
    PRO_COMPLETE = "PRO_COMPLETE",
    //Pro
    PRO_CLOSE = "PRO_CLOSE",
    LEAVE = 'LEAVE',
    REFUND_REQUEST = 'REFUND_REQUEST',
    REFUND_APPROVED = 'REFUND_APPROVED',
    REFUND_REJECTED = 'REFUND_REJECTED',
    INVALIDATED = 'INVALIDATED'
  }

  export enum MessageType {
    PLAIN = 'PLAIN',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    DOCUMENT = 'DOCUMENT',
    FILE = 'FILE',
    EVENT = 'EVENT'
  }
}
