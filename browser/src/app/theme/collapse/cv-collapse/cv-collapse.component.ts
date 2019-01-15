import {
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  Renderer2,
  Self,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '../../util/util';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'cv-collapse',
  templateUrl: './cv-collapse.component.html',
  styleUrls: ['./cv-collapse.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('collapsedContent', [
      transition('* => true', [
        style({height: '0'}),
        animate(300)
      ]),
      state('false', style({height: '0px'})),
      transition('true => false', animate('200ms linear')),
    ]),
    trigger('collapsedArrow', [
      state('true', style({transform: 'rotate(90deg)'})),
      state('false', style({transform: 'rotate(0deg)'})),
      transition('true => false', animate('300ms linear')),
      transition('false => true', animate('200ms linear'))
    ])
  ]
})
export class CvCollapseComponent {
  @Output() collapsedChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() toggle: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() title = '';


  @Input()
  get collapsed(): boolean {
    return this._collapsed;
  }

  set collapsed(value: boolean) {
    this.collapsedChange.emit(value);
    this.toggle.emit(value);
    this._collapsed = value;
  }

  private _collapsed: boolean = false;

  constructor(public elementRef: ElementRef) {
  }

  isCollapsed(): boolean {
    return !!this.collapsed;
  }

}



