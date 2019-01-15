import { Component, ComponentRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { animate, state, style, transition, trigger } from "@angular/animations";
import { SystemMessageType } from '../../model/data-model';

@Component({
  selector: 'response-message',
  templateUrl: 'response-message.component.html',
  styleUrls: ['response-message.component.scss'],
  animations: [
    trigger('showHide', [
      state('in', style({height: '100%'})),
      transition(':enter', [
        style({height: '0', }),
        animate(200)
      ]),
      transition(':leave', [
        animate(200, style({height: '0'}))
      ])
    ])
  ]
})

export class ResponseMessageComponent implements OnInit {
  @Input()
  type: SystemMessageType = SystemMessageType.INFO;
  @Input()
  message: string = "Unknown error!";
  @Input()
  showIcon: boolean = true;
  @Input()
  fontSize: string = "14";
  @Input()
  paddingV: string = "16";
  @Input()
  paddingH: string = "24";
  @Output() onHide = new EventEmitter<boolean>();

  public SystemMessageType = SystemMessageType;

  public mainStyle: any = {};

  constructor() {

  }

  ngOnInit() {
    this.mainStyle = {
      'font-size.px': this.fontSize,
      // 'padding-top.px': this.paddingV,
      // 'padding-bottom.px': this.paddingV,
      // 'padding-left.px': this.paddingH,
      // 'padding-right.px': this.paddingH
    }
  }

  destroy(){
    this.onHide.emit(false)
  }


}
