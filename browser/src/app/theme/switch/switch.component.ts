import { Component, EventEmitter, forwardRef, HostListener, Input, Output, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CvCheckbox } from '../checkbox/cv-checkbox/cv-checkbox';

export const SWITCH_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CvSwitchComponent),
  multi: true
};

@Component({
  selector: 'cv-switch',
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  providers: [SWITCH_VALUE_ACCESSOR]
})
export class CvSwitchComponent implements ControlValueAccessor {

  @Input() disabled: boolean = false;
  @Input() onLabel: string = 'On';
  @Input() offLabel: string = 'Off';
  @Output() changeState: EventEmitter<any> = new EventEmitter();

  model: any;

  constructor() {
  }

  @HostListener('click', ['$event'])
  toggle(event: MouseEvent): void {
    this.model = !this.model;
    this.onChange(this.model);
    this.changeState.emit(this.model);
  }

  writeValue(model: any): void {
    this.model = model;
    if(model) {
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private onTouched = () => {
  };
  private onChange = (_: any) => {
  };

}
