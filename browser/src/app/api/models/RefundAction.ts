export class RefundAction {
  id: number;
  author: string;
  text: string;
  action: RefundAction.Action;
  created: string;
}

export namespace RefundAction {
  export enum Action {
    COMMENT = 'COMMENT',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
  }
}
