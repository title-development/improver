export class Refund {
  id: number;
  issue: Refund.Issue;
  option: Refund.Option;
  comment: string;
  status: Refund.Status;
  notes: string;
  created: string;
  updated: string;
  contractor?: string;
  customer?: string;
  projectRequestId?: number;
  projectId?: number;
}


export namespace Refund  {

  export class Questionary {
    zip: string;
    serviceName: string;
    issues: RefundIssue[];
  }

  export class RefundIssue {
    name: Issue;
    question: string;
    text: string;
    options: RefundOptions[];
  }

  export class RefundOptions {
    name: Option;
    text: string;
  }

  export enum Issue {
    WRONG_ZIP = 'WRONG_ZIP',
    WRONG_SERVICE = 'WRONG_SERVICE',
    WONT_DO = 'WONT_DO',
    NOT_AGREED = 'NOT_AGREED',
    INVALID_LEAD = 'INVALID_LEAD'
  }

  export enum Status {
    IN_REVIEW = 'IN_REVIEW',
    REJECTED = 'REJECTED',
    APPROVED = 'APPROVED',
    AUTO_REJECTED = 'AUTO_REJECTED',
    AUTO_APPROVED = 'AUTO_APPROVED'
  }

  export enum Option {
    NEVER_WORK_IN_ZIP = 'NEVER_WORK_IN_ZIP',
    SOMETIMES_WORK_IN_ZIP = 'SOMETIMES_WORK_IN_ZIP',
    JOB_NOT_FOR_ZIP = 'JOB_NOT_FOR_ZIP',
    NEVER_DO_SERVICE = 'NEVER_DO_SERVICE',
    SOMETIMES_DO_SERVICE = 'SOMETIMES_DO_SERVICE',
    JOB_NOT_FOR_SERVICE = 'JOB_NOT_FOR_SERVICE',
    JOB_TOO_SMALL = 'JOB_TOO_SMALL',
    NOT_EQUIPPED = 'NOT_EQUIPPED',
    NOT_READY_TO_HIRE = 'NOT_READY_TO_HIRE',
    // HIRED_ELSE = 'HIRED_ELSE',
    DECLINED = 'DECLINED',
    NOT_SCHEDULED = 'NOT_SCHEDULED',
    NOT_AGREED_PRICE = 'NOT_AGREED',
    DUPLICATE = 'DUPLICATE',
    NOTHING_TO_DO = 'NOTHING_TO_DO',
    NO_RESPOND = 'NO_RESPOND',
    NOT_ENOUGH_INFO = 'NOT_ENOUGH_INFO',
    BAD_CONTACT_INFO = 'BAD_CONTACT_INFO',
    CLOSED = 'CLOSED',
    OTHER = 'OTHER'
  }

  export class Request {
    issue?: Issue;
    option?: Option;
    note?: string;
    removeZip?: boolean;
    removeService?: boolean
  }

  export class Result {
    comment?: string;
    status?: Status;
    created?: string;
  }

}
