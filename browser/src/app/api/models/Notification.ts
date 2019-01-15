export class Notification {
  id: number;
  icon: string;
  created: string;
  link: string;
  payload: string;
  read: boolean
}

export namespace Notification {
  export enum Type {
    BILLING = 'BILLING',
    PLAIN = 'PLAIN'
  }
}
