import { ApplicationRef, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { PopUpMessage, SystemMessageType } from '../../model/data-model';
import { PopUpMessageContainerComponent } from "./pop-up-message-container/pop-up-message-container.component";

// TODO: Leave animation does not work. Its an Angular bug
// https://github.com/angular/angular/issues/14813
@Component({
  selector: 'app-pop-up-message',
  templateUrl: './pop-up-message.component.html',
  styleUrls: ['./pop-up-message.component.scss'],
  animations: [
    trigger('showHide', [
      transition(':enter', [
        style({height: '0'}),
        animate(300)
      ]),
      transition(':leave', [
        style({height: '0'}),
        animate(200)
      ])
    ]),
    trigger('fadeMessage', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('300ms 200ms', style({ opacity: 1 }))
      ]),
      transition('* => void', [
        style({ opacity: 1 }),
        animate('10ms', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class PopUpMessageComponent implements OnInit {

  @Input()
  message: PopUpMessage;
  @Output()
  onMessageDestroy: EventEmitter<any> = new EventEmitter();
  SystemMessageType = SystemMessageType;

  private destroyTimeout;

  constructor(public elementRef: ElementRef,
              public messageContainer: PopUpMessageContainerComponent) {
    messageContainer.messageInit(this);
  }

  ngOnInit() {
    this.clearTimeout();
  }

  destroy() {
    this.onMessageDestroy.emit();
  }

  clearTimeout() {
    if (this.destroyTimeout) {
      clearTimeout(this.destroyTimeout);
    }
    this.destroyTimeout = setTimeout(() => {
      this.destroy();
    }, this.message.timeout);
  }

}
