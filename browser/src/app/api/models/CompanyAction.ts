export class CompanyAction {
  id: number;
  author: string;
  text: string;
  created: string;
  action: CompanyAction.Action;
}

export namespace CompanyAction {
  export enum Action {
    COMMENT = 'COMMENT',
    UPDATE_INFO = 'UPDATE_INFO',
    UPDATE_COVERAGE = 'UPDATE_COVERAGE',
    UPDATE_SERVICES = 'UPDATE_SERVICES',
    SUBSCRIBE = 'SUBSCRIBE'
  }
}
