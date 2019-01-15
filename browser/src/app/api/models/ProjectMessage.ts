import { MessengerDocument } from './MessengerDocument';

export class ProjectMessage {
  id?: string;
  sender: string;
  created: string;
  body: string | MessengerDocument;
  type: string;
  event: string;
  read?: boolean;

  constructor(sender: string, body: string | MessengerDocument, type: string, event: string) {
    this.sender = sender;
    this.created = null;
    this.body = body;
    this.type = type;
    this.event = event;
  }
}
