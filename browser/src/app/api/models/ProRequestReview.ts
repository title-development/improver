export class ProRequestReview {
  emails: Array<string>;
  subject: string;
  message: string;

  constructor(emails: string, subject: string, message: string) {
    this.emails = emails.split(',').map(email => email.trim());
    this.subject = subject;
    this.message = message;
  }
}
