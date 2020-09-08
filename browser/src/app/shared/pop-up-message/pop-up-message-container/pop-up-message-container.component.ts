import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core';
import { PopUpMessage } from '../../../model/data-model';
import { PopUpMessageComponent } from "../pop-up-message.component";

@Component({
  selector: 'app-pop-up-message-container',
  templateUrl: './pop-up-message-container.component.html',
  styleUrls: ['./pop-up-message-container.component.scss']
})
export class PopUpMessageContainerComponent implements OnInit {

  @Output()
  onMessageDestroy: EventEmitter<any> = new EventEmitter();

  public messages: PopUpMessage[] = [];
  public popUpMessages: PopUpMessageComponent[] = [];
  private messageId: number = 0;

  constructor(public elementRef: ElementRef) {
  }

  ngOnInit() {

  }

  messageDestroy(id) {
    this.onMessageDestroy.emit(id)
  }

  addMessage(newNessage): number {
    let messageNotExists: boolean = true;
    let messageId: number;

    this.messages.forEach( message => {
      if (newNessage.text == message.text) {
        messageNotExists = false;
        messageId = message.id;
      }
    });
    if (messageNotExists) {
      newNessage.id = ++this.messageId;
      this.messages.unshift(newNessage);
      messageId = newNessage.id;
    }

    return messageId;
  }

  messageInit(messageComponent: PopUpMessageComponent) {
    this.popUpMessages.unshift(messageComponent)
  }

  getMessage(id) {
    return this.popUpMessages.filter(component => {
      return component.message.id == id;
    })[0];
  }

}
