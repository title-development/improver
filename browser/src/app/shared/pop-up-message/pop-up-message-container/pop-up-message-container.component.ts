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

  addMessage(message): number {
    message.id = ++this.messageId;
    this.messages.unshift(message);
    return message.id;
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
