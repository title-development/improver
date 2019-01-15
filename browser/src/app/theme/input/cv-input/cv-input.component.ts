import {
  Component, ElementRef, HostBinding, Input, OnInit, Optional, Self,
  ViewEncapsulation
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { coerceBooleanProperty } from '../../util/util';

@Component({
  selector: 'input[cv-input], textarea[cv-input]',
  template: '',
  styleUrls: ['./cv-input.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'cv-input',
    '[disabled]': 'disabled',
    '[readonly]': 'readonly',
    '[class.-disabled]': 'disabled',
    '[class.-readonly]': 'readonly',
    '[class.-submitted]': 'isSubmitted()'
  }
})
export class CvInputComponent {
  @Input() required;
  private _disabled: boolean = false;
  private _readonly: boolean;

  @HostBinding('class.-icon') private _icon: boolean;
  @HostBinding('class.-hint') private _hint: boolean;

  @Input()
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled() {
    return this.ngControl ? this.ngControl.disabled : this._disabled;
  }

  @Input()
  get readonly() {
    return this._readonly;
  }

  set readonly(value: any) {
    this._readonly = coerceBooleanProperty(value);
  }

  set icon(value: boolean) {
    this._icon = value;
  }

  get icon(): boolean {
    return this._icon;
  }

  set hint(value: boolean) {
    this._hint = value;
  }

  get hint(): boolean {
    return this._hint;
  }

  constructor(@Optional() @Self() public ngControl: NgControl,
              public elementRef: ElementRef
  ) {
  }

  isRequired(): boolean {
    return this.required != undefined;
  }

  isSubmitted(): boolean {
    return this.ngControl && (this.ngControl as any)._parent && (this.ngControl as any)._parent.submitted;
  }
}
