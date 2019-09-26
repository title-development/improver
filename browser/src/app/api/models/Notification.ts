export class Notification {
  id: number;
  icon: string;
  created: string;
  link: string;
  payload: string;
  read: boolean;
  newMessage: boolean;
}

export namespace Notification {
  export enum Type {
    BILLING = 'BILLING',
    PLAIN = 'PLAIN',
    UNREAD_MESSAGES = 'UNREAD_MESSAGES'
  }
}
